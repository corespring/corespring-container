package org.corespring.shell

import org.corespring.amazon.s3.ConcreteS3Service
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.hooks._
import org.corespring.container.client.controllers._
import org.corespring.container.client.integration.DefaultIntegration
import org.corespring.container.components.model.Component
import org.corespring.container.components.model.dependencies.DependencyResolver
import org.corespring.mongo.json.services.MongoService
import org.corespring.shell.controllers.catalog.actions.{ CatalogHooks => ShellCatalogHooks }
import org.corespring.shell.controllers.editor.actions.{ EditorHooks => ShellEditorHooks }
import org.corespring.shell.controllers.editor.{ ItemHooks => ShellItemHooks }
import org.corespring.shell.controllers.player.actions.{ PlayerHooks => ShellPlayerHooks }
import org.corespring.shell.controllers.player.{ SessionHooks => ShellSessionHooks }
import org.corespring.shell.controllers.{ CachedAndMinifiedComponentSets, ShellDataQuery => ShellProfile }
import play.api.Configuration
import play.api.mvc._

import scala.concurrent.{ ExecutionContext, Future }

class ContainerClientImplementation(
  val itemService: MongoService,
  val sessionService: MongoService,
  componentsIn: => Seq[Component],
  val configuration: Configuration) extends DefaultIntegration {

  override def components: Seq[Component] = componentsIn

  implicit def ec: ExecutionContext = ExecutionContext.Implicits.global

  override def playerLauncherHooks: PlayerLauncherHooks = new PlayerLauncherHooks {

    val loader = new LoadJs {}

    /**
     * Provides a few hooks so that you can simulate scenarios when loading player:
     * ?secure - a secure request
     * ?jsErrors  - throw errors when loading the player js
     * ?pageErrors - throw errors when loading the player page
     * @param block
     * @return
     */

    override def playerJs(implicit header: RequestHeader): Future[PlayerJs] = loader.loadJs(header)

    override def editorJs(implicit header: RequestHeader): Future[PlayerJs] = loader.loadJs(header)

  }

  lazy val assets = new Assets {

    private lazy val key = configuration.getString("amazon.s3.key")
    private lazy val secret = configuration.getString("amazon.s3.secret")
    private lazy val bucket = configuration.getString("amazon.s3.bucket").getOrElse(throw new RuntimeException("No bucket specified"))

    lazy val playS3 = {
      val out = for {
        k <- key
        s <- secret
      } yield {
        new ConcreteS3Service(k, s)
      }
      out.getOrElse(throw new RuntimeException("No amazon key/secret"))
    }

    override def loadAsset(id: String, file: String)(request: Request[AnyContent]): SimpleResult = {
      playS3.download(bucket, s"$id/$file", Some(request.headers))
    }

    override def getItemId(sessionId: String): Option[String] = ContainerClientImplementation.this.sessionService.load(sessionId).map {
      json => (json \ "itemId").as[String]
    }

    override def hooks: AssetHooks = new AssetHooks {

      override def delete(itemId: String, file: String)(implicit header: RequestHeader): Future[Option[StatusMessage]] = Future {
        val response = playS3.delete(bucket, s"$itemId/$file")
        if (response.success) {
          None
        } else {
          Some((BAD_REQUEST -> s"${response.key}: ${response.msg}"))
        }
      }

      override def uploadAction(itemId: String, file: String)(block: (Request[Int]) => SimpleResult): Action[Int] = Action(playS3.upload(bucket, s"$itemId/$file")) { r =>
        block(r)
      }
    }

    override implicit def ec: ExecutionContext = ExecutionContext.Implicits.global
  }

  lazy val componentUrls = new CachedAndMinifiedComponentSets {
    override def allComponents: Seq[Component] = ContainerClientImplementation.this.components

    override def configuration = ContainerClientImplementation.this.configuration.getConfig("components").getOrElse(Configuration.empty)

    override def dependencyResolver: DependencyResolver = new DependencyResolver {
      override def components: Seq[Component] = allComponents
    }
  }

  override def editorHooks: EditorHooks = new ShellEditorHooks {
    override def itemService: MongoService = ContainerClientImplementation.this.itemService
  }

  override def catalogHooks: CatalogHooks = new ShellCatalogHooks {
    override def itemService: MongoService = ContainerClientImplementation.this.itemService
  }

  override def sessionHooks: SessionHooks = new ShellSessionHooks {
    override def itemService: MongoService = ContainerClientImplementation.this.itemService

    override def sessionService: MongoService = ContainerClientImplementation.this.sessionService

    override implicit def ec: ExecutionContext = scala.concurrent.ExecutionContext.Implicits.global
  }

  override def itemHooks: ItemHooks = new ShellItemHooks {
    override def itemService: MongoService = ContainerClientImplementation.this.itemService

  }

  override def playerHooks: PlayerHooks = new ShellPlayerHooks {
    override def sessionService: MongoService = ContainerClientImplementation.this.sessionService

    override def itemService: MongoService = ContainerClientImplementation.this.itemService

    override implicit def ec: ExecutionContext = ContainerClientImplementation.this.ec
  }

  override def dataQuery: DataQuery = new ShellProfile()
}

trait LoadJs {

  import scala.concurrent.ExecutionContext.Implicits.global

  //Implemented as trait so it can be tested without setup
  def loadJs(implicit header: RequestHeader): Future[PlayerJs] = Future {
    def isSecure = header.getQueryString("secure").map {
      _ == "true"
    }.getOrElse(false)
    def errors = header.getQueryString("jsErrors").map {
      s => s.split(",").toSeq
    }.getOrElse(Seq())

    val updatedSession = header.getQueryString("pageErrors").map {
      s =>
        header.session + (SessionKeys.failLoadPlayer -> s)
    }.getOrElse {
      header.session - SessionKeys.failLoadPlayer
    }

    PlayerJs(isSecure, errors /*, updatedSession?*/ )
  }
}

