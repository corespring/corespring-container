package org.corespring.shell

import java.io.File
import java.net.URLDecoder

import com.typesafe.config.ConfigFactory
import org.apache.commons.io.{ FileUtils, IOUtils }
import org.corespring.amazon.s3.ConcreteS3Service
import org.corespring.container.client.controllers.{ AssetType, _ }
import org.corespring.container.client.hooks._
import org.corespring.container.client.integration.DefaultIntegration
import org.corespring.container.client.{ AssetUtils, CompressedAndMinifiedComponentSets, VersionInfo }
import org.corespring.container.components.model.Component
import org.corespring.container.components.model.dependencies.DependencyResolver
import org.corespring.container.logging.ContainerLogger
import org.corespring.mongo.json.services.MongoService
import org.corespring.shell.controllers.ShellDataQueryHooks
import org.corespring.shell.controllers.catalog.actions.{ CatalogHooks => ShellCatalogHooks }
import org.corespring.shell.controllers.editor.actions.{ EditorHooks => ShellEditorHooks }
import org.corespring.shell.controllers.editor.{ ItemDraftHooks => ShellItemDraftHooks, ItemHooks => ShellItemHooks, ItemDraftAssets, CollectionHooks => ShellCollectionHooks }
import org.corespring.shell.controllers.player.actions.{ PlayerHooks => ShellPlayerHooks }
import org.corespring.shell.controllers.player.{ SessionHooks => ShellSessionHooks }
import org.corespring.shell.services.ItemDraftService
import play.api.libs.json.JsObject
import play.api.mvc._
import play.api.{ Configuration, Mode, Play }

import scala.concurrent.{ ExecutionContext, Future }

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

  lazy val logger = ContainerLogger.getLogger("ContainerClientImplementation")

  override def components: Seq[Component] = componentsIn

  override implicit def ec: ExecutionContext = ExecutionContext.Implicits.global

  override def playerLauncherHooks: PlayerLauncherHooks = new PlayerLauncherHooks {

    val loader = new LoadJs {}

    /**
     * Provides a few hooks so that you can simulate scenarios when loading player:
     * ?secure - a secure request
     * ?jsErrors  - throw errors when loading the player js
     * ?pageErrors - throw errors when loading the player page
     * @return
     */

    override def playerJs(implicit header: RequestHeader): Future[PlayerJs] = loader.loadJs(header)

    override def editorJs(implicit header: RequestHeader): Future[PlayerJs] = loader.loadJs(header)

    override def catalogJs(implicit header: RequestHeader): Future[PlayerJs] = loader.loadJs(header)

  }

  object s3 {
    lazy val key = configuration.getString("amazon.s3.key")
    lazy val secret = configuration.getString("amazon.s3.secret")
    lazy val bucket = configuration.getString("amazon.s3.bucket").getOrElse(throw new RuntimeException("No bucket specified"))
  }

  lazy val assets = new Assets with ItemDraftAssets {

    lazy val (playS3, assetUtils) = {
      val out = for {
        k <- s3.key
        s <- s3.secret
      } yield {
        val s3Service = new ConcreteS3Service(k, s)
        val assetUtils = new AssetUtils(s3Service.client, s3.bucket)
        (s3Service, assetUtils)

      }
      out.getOrElse(throw new RuntimeException("No amazon key/secret"))
    }

    override implicit def ec: ExecutionContext = ContainerClientImplementation.this.ec

    import AssetType._

    private def mkPath(t: AssetType, rest: String*) = (t.folderName +: rest).mkString("/").replace("~", "/")

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
        None
      } else {
        Some(BAD_REQUEST -> s"${response.key}: ${response.msg}")
      }
    }

    override def upload(t: AssetType, id: String, path: String)(predicate: (RequestHeader) => Option[SimpleResult]): BodyParser[Future[UploadResult]] = {
      playS3.s3ObjectAndData[Unit](s3.bucket, _ => mkPath(t, id, path))((rh) => {
        predicate(rh).map { err =>
          Left(err)
        }.getOrElse(Right(Unit))
      }).map { f =>
        f.map { tuple => UploadResult(tuple._1.getKey) }
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

  }

  lazy val componentSets = new CompressedAndMinifiedComponentSets {

    import play.api.Play.current

    override def allComponents: Seq[Component] = ContainerClientImplementation.this.components

    override def configuration = {
      val rc = ContainerClientImplementation.this.configuration
      val c = ConfigFactory.parseString(
        s"""
             |minify: ${rc.getBoolean("components.minify").getOrElse(Play.mode == Mode.Prod)}
             |gzip: ${rc.getBoolean("components.gzip").getOrElse(Play.mode == Mode.Prod)}
             |path: ${rc.getString("components.path").getOrElse("?")}
           """.stripMargin)

      new Configuration(c)
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

  override def editorHooks: EditorHooks = new ShellEditorHooks {
    override def draftItemService = ContainerClientImplementation.this.draftItemService

    override def assets: Assets = ContainerClientImplementation.this.assets

    override def itemService: MongoService = ContainerClientImplementation.this.itemService
  }

  override def catalogHooks: CatalogHooks = new ShellCatalogHooks {
    override def itemService: MongoService = ContainerClientImplementation.this.itemService
    override def assets: Assets = ContainerClientImplementation.this.assets
  }

  override def sessionHooks: SessionHooks = new ShellSessionHooks {
    override def itemService: MongoService = ContainerClientImplementation.this.itemService

    override def sessionService: MongoService = ContainerClientImplementation.this.sessionService

    override implicit def ec: ExecutionContext = ContainerClientImplementation.this.ec
  }

  override def itemDraftHooks: ItemDraftHooks = new ShellItemDraftHooks {
    override def itemService: MongoService = ContainerClientImplementation.this.itemService

    override def draftItemService = ContainerClientImplementation.this.draftItemService

    override def assets: ItemDraftAssets = ContainerClientImplementation.this.assets
  }

  override def playerHooks: PlayerHooks = new ShellPlayerHooks {
    override def sessionService: MongoService = ContainerClientImplementation.this.sessionService
    override def assets: Assets = ContainerClientImplementation.this.assets

    override def itemService: MongoService = ContainerClientImplementation.this.itemService

    override implicit def ec: ExecutionContext = ContainerClientImplementation.this.ec
  }

  override def dataQueryHooks: DataQueryHooks = new ShellDataQueryHooks {
    override implicit def ec: ExecutionContext = ContainerClientImplementation.this.ec
  }

  override def versionInfo: JsObject = VersionInfo(Play.current.configuration)

  override def itemHooks: ItemHooks = new ShellItemHooks {
    override def itemService: MongoService = ContainerClientImplementation.this.itemService
  }

  override def collectionHooks: CollectionHooks = new ShellCollectionHooks {

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
