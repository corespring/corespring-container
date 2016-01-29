package org.corespring.shell

import java.io.{ ByteArrayInputStream, File }
import java.net.URLDecoder

import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.model.ObjectMetadata
import org.apache.commons.io.{ FileUtils, IOUtils }
import org.bson.types.ObjectId
import org.corespring.amazon.s3.{ ConcreteS3Service, S3Service }
import org.corespring.container.client._
import org.corespring.container.client.controllers.{ AssetType, _ }
import org.corespring.container.client.hooks._
import org.corespring.container.client.integration.{ ContainerExecutionContext, DefaultIntegration }
import org.corespring.container.components.model.Component
import org.corespring.container.components.model.dependencies.DependencyResolver
import org.corespring.mongo.json.services.MongoService
import org.corespring.shell.controllers.catalog.actions.{ CatalogHooks => ShellCatalogHooks }
import org.corespring.shell.controllers.editor.actions.{ DraftEditorHooks => ShellDraftEditorHooks, DraftId, ItemEditorHooks => ShellItemEditorHooks }
import org.corespring.shell.controllers.editor.{ CollectionHooks => ShellCollectionHooks, ContainerSupportingMaterialAssets, ItemAssets, ItemDraftAssets, ItemDraftHooks => ShellItemDraftHooks, ItemHooks => ShellItemHooks, SupportingMaterialAssets }
import org.corespring.shell.controllers.player.actions.{ PlayerHooks => ShellPlayerHooks }
import org.corespring.shell.controllers.player.{ SessionHooks => ShellSessionHooks }
import org.corespring.shell.controllers.{ ShellDataQueryHooks, editor => shellEditor }
import org.corespring.shell.services.ItemDraftService
import play.api.libs.MimeTypes
import play.api.libs.json.JsObject
import play.api.mvc._
import play.api.{ Configuration, Logger, Mode, Play }
import play.api.libs.json._
import play.api.libs.json.Reads._

import scala.concurrent.{ ExecutionContext, Future }
import scalaz.{ Failure, Success, Validation }

class ContainerClientImplementation(
  val itemService: MongoService,
  val sessionService: MongoService,
  val draftItemService: ItemDraftService,
  componentsIn: => Seq[Component],
  val configuration: Configuration) extends DefaultIntegration {

  override def resolveDomain(path: String): String = {
    val separator = if (path.startsWith("/")) "" else "/"
    configuration.getString("cdn.domain").map { d =>
      logger.trace(s"cdn.domain: $d")
      s"$d$separator$path"
    }.getOrElse(path)
  }

  override def itemAssetResolver: ItemAssetResolver = new ItemAssetResolver {
    override def resolve(itemId: String)(file: String): String = {
      resolveDomain(super.resolve(itemId)(file))
    }
  }

  lazy val logger = Logger(classOf[ContainerClientImplementation])

  override def components: Seq[Component] = componentsIn

  override def containerContext: ContainerExecutionContext = new ContainerExecutionContext(ExecutionContext.global)

  override def playerLauncherHooks: PlayerLauncherHooks = new PlayerLauncherHooks {

    val loader = new LoadJs {}

    /**
     * Provides a few hooks so that you can simulate scenarios when loading player:
     * ?secure - a secure request
     * ?jsErrors  - throw errors when loading the player js
     * ?pageErrors - throw errors when loading the player page
 *
     * @return
     */

    override def playerJs(implicit header: RequestHeader): Future[PlayerJs] = loader.loadJs(header)

    override def editorJs(implicit header: RequestHeader): Future[PlayerJs] = loader.loadJs(header)

    override def catalogJs(implicit header: RequestHeader): Future[PlayerJs] = loader.loadJs(header)

    override def containerContext: ContainerExecutionContext = ContainerClientImplementation.this.containerContext

    override def componentEditorJs(implicit header: RequestHeader): Future[Option[String]] = {
      loader.loadJs(header).map{ pj =>
        //TODO: what are the restrictions on loading a standalone component editor?
        if(pj.errors.length > 0){
          Some(pj.errors.mkString(","))
        }  else {
          None
        }
      }
    }
    }

  object s3 {
    lazy val key = configuration.getString("amazon.s3.key")
    lazy val secret = configuration.getString("amazon.s3.secret")
    lazy val bucket = configuration.getString("amazon.s3.bucket").getOrElse(throw new RuntimeException("No bucket specified"))
  }

  lazy val s3Client: AmazonS3 = {
    for {
      k <- s3.key
      s <- s3.secret
    } yield {
      val fakeEndpoint = configuration.getString("amazon.s3.fake-endpoint")
      logger.trace(s"fakeEndpoint: $fakeEndpoint")
      S3Service.mkClient(k, s, fakeEndpoint)
    }
  }.getOrElse(throw new RuntimeException("no s3 client "))

  lazy val (playS3, assetUtils) = {
    val s3Service = new ConcreteS3Service(s3Client)
    val assetUtils = new AssetUtils(s3Client, s3.bucket)
    (s3Service, assetUtils)
  }

  lazy val itemSupportingMaterialAssets = new ContainerSupportingMaterialAssets[String](
    s3.bucket,
    s3Client,
    playS3,
    (id: String, rest: Seq[String]) => ("items" +: id +: "materials" +: rest).mkString("/").replace("~", "/"))

  lazy val itemDraftSupportingMaterialAssets = new ContainerSupportingMaterialAssets[DraftId[ObjectId]](
    s3.bucket,
    s3Client,
    playS3,
    (id: DraftId[ObjectId], rest: Seq[String]) => ("item-drafts" +: id.itemId +: id.name +: "materials" +: rest).mkString("/").replace("~", "/"))

  lazy val assets = new Assets with ItemDraftAssets with ItemAssets {

    import AssetType._

    private def mkPath(t: AssetType, id: String, rest: String*) = {
      (t.folderName +: id +: rest).mkString("/").replace("~", "/")
    }

    private def mkSupportingMaterialPath(t: AssetType, id: String, rest: String*) = {
      mkPath(t, id, ("materials" +: rest): _*)
    }

    override def load(t: AssetType, id: String, path: String)(implicit h: RequestHeader): SimpleResult = {
      val result = playS3.download(s3.bucket, URLDecoder.decode(mkPath(t, id, path), "utf-8"), Some(h.headers))

      if (result.header.status == OK || result.header.status == NOT_MODIFIED) {
        result
      } else {
        playS3.download(s3.bucket, mkPath(t, id, path), Some(h.headers))
      }
    }

    override def delete(t: AssetType, id: String, path: String)(implicit h: RequestHeader): Future[Option[(Int, String)]] = Future {
      val response = playS3.delete(s3.bucket, mkPath(t, id, path))
      if (response.success) {
        val fileName = path.substring(path.lastIndexOf('/') + 1)
        itemService.load(id) match {
          case Some(item) =>
            val transformer = (__ \ "files").json.update(
              of[JsArray].map { case JsArray(arr) => JsArray(arr.filterNot(_ \ "name" == JsString(fileName))) })
            val fallback = __.json.update((__ \ "files").json.put(JsArray(Seq())))
            item.transform(transformer).orElse(item.transform(fallback)) match {
              case succ: JsSuccess[JsObject] =>
                itemService.save(id, succ.get)
              case _ =>
            }
          case _ =>
        }
        None
      } else {
        Some(BAD_REQUEST -> s"${response.key}: ${response.msg}")
      }
    }

    override def upload(t: AssetType, id: String, path: String)(predicate: (RequestHeader) => Option[SimpleResult]): BodyParser[Future[UploadResult]] = {

      def contentType(s: String) = {
        val regexp = """\.(\w+?)$""".r
        regexp.findFirstMatchIn(s.toLowerCase) match {
          case Some(res) => MimeTypes.forExtension(res.group(0)).getOrElse("image/png")
          case _ => "image/png"
        }
      }

      playS3.s3ObjectAndData[Unit](s3.bucket, _ => mkPath(t, id, path))((rh) => {
        predicate(rh).map { err =>
          Left(err)
        }.getOrElse(Right(Unit))
      }).map { f =>
        f.map { tuple =>
          itemService.load(id) match {
            case Some(item) =>
              val fileObj = Json.obj(
                "name" -> tuple._1.getKey.substring(tuple._1.getKey.lastIndexOf('/') + 1),
                "contentType" -> contentType(tuple._1.getKey))
              val transformer = (__ \ "files").json.update(
                of[JsArray].map { case JsArray(arr) => JsArray(arr :+ fileObj) })
              val fallback = __.json.update((__ \ "files").json.put(JsArray(Seq(fileObj))))
              item.transform(transformer).orElse(item.transform(fallback)) match {
                case succ: JsSuccess[JsObject] =>
                  itemService.save(id, succ.get)
                case _ =>
              }
            case _ =>
          }
          UploadResult(tuple._1.getKey)
        }
      }
    }
    override def copyItemToDraft(itemId: String, draftName: String): Unit = {
      assetUtils.copyDir(mkPath(AssetType.Item, itemId), mkPath(AssetType.Draft, itemId, draftName))
    }

    override def deleteDraft(draftId: String): Unit = {
      assetUtils.deleteDir(mkPath(AssetType.Draft, draftId))
    }

    override def copyDraftToItem(draftName: String, itemId: String): Unit = {
      assetUtils.copyDir(mkPath(AssetType.Draft, itemId, draftName), mkPath(AssetType.Item, itemId))
    }

    override def deleteItem(id: String): Unit = assetUtils.deleteDir(mkPath(AssetType.Item, id))

    private def uploadSupportingMaterialBinaryToPath(key: String, binary: Binary): Validation[String, String] = {
      val is = new ByteArrayInputStream(binary.data)
      val metadata = new ObjectMetadata()
      metadata.setContentType(binary.mimeType)
      metadata.setContentLength(binary.data.length)

      logger.trace(s"[upload material] key: $key")
      try {
        s3Client.putObject(s3.bucket, key, is, metadata)
        Success(key)
      } catch {
        case t: Throwable => {
          if (logger.isDebugEnabled) {
            t.printStackTrace()
          }
          Failure(t.getMessage)
        }
      }
    }

    override def uploadSupportingMaterialBinary(id: String, binary: Binary): Validation[String, String] = {
      val key = mkSupportingMaterialPath(AssetType.Item, id, binary.name)
      logger.trace(s"[upload material] key: $key")
      uploadSupportingMaterialBinaryToPath(key, binary)
    }

    override def containerContext: ContainerExecutionContext = ContainerClientImplementation.this.containerContext
  }

  lazy val componentSets = new CompressedAndMinifiedComponentSets {

    import play.api.Play.current

    override def componentSetContext = ComponentSetExecutionContext(
      ContainerClientImplementation.this.containerContext.context)

    override def allComponents: Seq[Component] = ContainerClientImplementation.this.components

    override def configuration = {
      val rc = ContainerClientImplementation.this.configuration
      Configuration.from(Map(
        "minify" -> rc.getBoolean("components.minify").getOrElse(Play.mode == Mode.Prod),
        "gzip" -> rc.getBoolean("components.gzip").getOrElse(Play.mode == Mode.Prod),
        "path" -> rc.getString("components.path").getOrElse("?")))
    }

    override def dependencyResolver: DependencyResolver = new DependencyResolver {
      override def components: Seq[Component] = allComponents
    }

    override def resource(path: String): Option[String] = Play.resource(s"container-client/bower_components/$path").map { url =>
      logger.trace(s"load resource $path")
      val input = url.openStream()
      val content = IOUtils.toString(input, "UTF-8")
      IOUtils.closeQuietly(input)
      content
    }

    override def loadLibrarySource(path: String): Option[String] = {
      val componentsPath = configuration.getString("path").getOrElse("?")
      val fullPath = s"$componentsPath/$path"
      val file = new File(fullPath)

      if (file.exists()) {
        logger.trace(s"load file: $path")
        Some(FileUtils.readFileToString(file, "UTF-8"))
      } else {
        Some(s"console.warn('failed to log $fullPath');")
      }
    }
  }

  override def draftEditorHooks: DraftEditorHooks = new ShellDraftEditorHooks {
    override def draftItemService = ContainerClientImplementation.this.draftItemService

    override def assets: Assets with ItemDraftAssets = ContainerClientImplementation.this.assets

    override def itemService: MongoService = ContainerClientImplementation.this.itemService

    override def containerContext: ContainerExecutionContext = ContainerClientImplementation.this.containerContext
  }

  override def itemEditorHooks: ItemEditorHooks = new ShellItemEditorHooks {
    override def assets: Assets = ContainerClientImplementation.this.assets

    override def itemService: MongoService = ContainerClientImplementation.this.itemService

    override def containerContext: ContainerExecutionContext = ContainerClientImplementation.this.containerContext
  }

  override def catalogHooks: CatalogHooks = new ShellCatalogHooks {
    override def itemService: MongoService = ContainerClientImplementation.this.itemService
    override def assets: Assets = ContainerClientImplementation.this.assets

    override def containerContext: ContainerExecutionContext = ContainerClientImplementation.this.containerContext
  }

  private[ContainerClientImplementation] trait withContext extends HasContainerContext {
    override def containerContext = ContainerClientImplementation.this.containerContext
  }

  override def sessionHooks: SessionHooks = new ShellSessionHooks with withContext {
    override def itemService: MongoService = ContainerClientImplementation.this.itemService

    override def sessionService: MongoService = ContainerClientImplementation.this.sessionService
  }

  override def itemDraftHooks: CoreItemHooks with DraftHooks = new shellEditor.ItemDraftHooks {
    override def itemService: MongoService = ContainerClientImplementation.this.itemService

    override def draftItemService = ContainerClientImplementation.this.draftItemService

    override def assets: ItemDraftAssets = ContainerClientImplementation.this.assets

    override def containerContext: ContainerExecutionContext = ContainerClientImplementation.this.containerContext
  }

  override def itemDraftSupportingMaterialHooks: ItemDraftSupportingMaterialHooks = new shellEditor.ItemDraftSupportingMaterialHooks {

    override def draftItemService: ItemDraftService = ContainerClientImplementation.this.draftItemService

    override def assets: SupportingMaterialAssets[DraftId[ObjectId]] = itemDraftSupportingMaterialAssets
  }

  override def itemHooks: CoreItemHooks with CreateItemHook = new shellEditor.ItemHooks {
    override def itemService: MongoService = ContainerClientImplementation.this.itemService

    override def assets: ItemAssets = ContainerClientImplementation.this.assets

    override def containerContext: ContainerExecutionContext = ContainerClientImplementation.this.containerContext
  }

  override def itemSupportingMaterialHooks: ItemSupportingMaterialHooks = new shellEditor.ItemSupportingMaterialHooks {

    override def itemService: MongoService = ContainerClientImplementation.this.itemService

    override def assets: SupportingMaterialAssets[String] = itemSupportingMaterialAssets
  }

  override def playerHooks: PlayerHooks = new ShellPlayerHooks {
    override def sessionService: MongoService = ContainerClientImplementation.this.sessionService
    override def assets: Assets = ContainerClientImplementation.this.assets

    override def itemService: MongoService = ContainerClientImplementation.this.itemService

    override def containerContext: ContainerExecutionContext = ContainerClientImplementation.this.containerContext
  }

  override def dataQueryHooks: DataQueryHooks = new ShellDataQueryHooks with withContext

  override def versionInfo: JsObject = VersionInfo(Play.current.configuration)

  override def collectionHooks: CollectionHooks = new shellEditor.CollectionHooks {
    override def containerContext: ContainerExecutionContext = ContainerClientImplementation.this.containerContext
  }

  override def itemMetadataHooks: ItemMetadataHooks = new shellEditor.ItemMetadataHooks {
    override def containerContext: ContainerExecutionContext = ContainerClientImplementation.this.containerContext
  }

}

/**
 * A simple shell utility to allow a tester to simulate page and/or js errors when launching the player js
 */
trait LoadJs {

  import scala.concurrent.ExecutionContext.Implicits.global

  //Implemented as trait so it can be tested without setup
  def loadJs(implicit header: RequestHeader): Future[PlayerJs] = Future {
    def isSecure = header.getQueryString("secure").exists(_ == "true")
    def errors = header.getQueryString("jsErrors").map {
      s => s.split(",").toSeq
    }.getOrElse(Seq())

    val updatedSession = header.getQueryString("pageErrors").map {
      s =>
        header.session + (SessionKeys.failLoadPlayer -> s)
    }.getOrElse {
      header.session - SessionKeys.failLoadPlayer
    }

    PlayerJs(isSecure, updatedSession, errors)
  }
}
