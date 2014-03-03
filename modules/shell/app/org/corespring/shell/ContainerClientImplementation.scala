package org.corespring.shell

import org.corespring.amazon.s3.ConcreteS3Service
import org.corespring.container.client.actions._
import org.corespring.container.client.controllers._
import org.corespring.container.client.integration.DefaultIntegration
import org.corespring.container.components.model.Component
import org.corespring.mongo.json.services.MongoService
import org.corespring.shell.controllers.CachedAndMinifiedComponentSets
import org.corespring.shell.controllers.editor.actions.{ EditorActions => ShellEditorActions }
import org.corespring.shell.controllers.editor.{ ItemActions => ShellItemActions }
import org.corespring.shell.controllers.player.actions.{ PlayerActions => ShellPlayerActions }
import org.corespring.shell.controllers.player.{ SessionActions => ShellSessionActions }
import play.api.Configuration
import play.api.mvc._
import scala.Some

class ContainerClientImplementation(
  val itemService: MongoService,
  val sessionService: MongoService,
  componentsIn: => Seq[Component],
  val configuration: Configuration) extends DefaultIntegration with LoadJs {

  override def components: Seq[Component] = componentsIn

  override def playerLauncherActions: PlayerLauncherActions[AnyContent] = new PlayerLauncherActions[AnyContent] {

    /**
     * Provides a few hooks so that you can simulate scenarios when loading player:
     * ?secure - a secure request
     * ?jsErrors  - throw errors when loading the player js
     * ?pageErrors - throw errors when loading the player page
     * @param block
     * @return
     */
    override def playerJs(block: (PlayerJsRequest[AnyContent]) => Result): Action[AnyContent] = loadJs(block)

    override def editorJs(block: (PlayerJsRequest[AnyContent]) => Result) = loadJs(block)

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

    //TODO: Need to look at a way of pre-validating before we upload - look at the predicate?
    override def uploadBodyParser(id: String, file: String): BodyParser[Int] = playS3.upload(bucket, s"$id/$file", (rh) => None)

    override def getItemId(sessionId: String): Option[String] = ContainerClientImplementation.this.sessionService.load(sessionId).map {
      json => (json \ "itemId").as[String]
    }
  }

  lazy val componentUrls = new CachedAndMinifiedComponentSets {
    override def allComponents: Seq[Component] = ContainerClientImplementation.this.components

    override def configuration = ContainerClientImplementation.this.configuration.getConfig("components").getOrElse(Configuration.empty)

  }

  override def editorActions: EditorActions[AnyContent] = new ShellEditorActions {
    override def itemService: MongoService = ContainerClientImplementation.this.itemService
  }

  override def sessionActions: SessionActions[AnyContent] = new ShellSessionActions {
    override def itemService: MongoService = ContainerClientImplementation.this.itemService

    override def sessionService: MongoService = ContainerClientImplementation.this.sessionService
  }

  override def itemActions: ItemActions[AnyContent] = new ShellItemActions {
    override def itemService: MongoService = ContainerClientImplementation.this.itemService
  }

  override def playerActions: PlayerActions[AnyContent] = new ShellPlayerActions {
    override def sessionService: MongoService = ContainerClientImplementation.this.sessionService

    override def itemService: MongoService = ContainerClientImplementation.this.itemService
  }
}

trait LoadJs {

  //Implemented as trait so it can be tested without setup
  def loadJs(block: PlayerJsRequest[AnyContent] => Result): Action[AnyContent] = Action {
    request =>
      def isSecure = request.getQueryString("secure").map {
        _ == "true"
      }.getOrElse(false)
      def errors = request.getQueryString("jsErrors").map {
        s => s.split(",").toSeq
      }.getOrElse(Seq())

      val updatedSession = request.getQueryString("pageErrors").map {
        s =>
          request.session + (SessionKeys.failLoadPlayer -> s)
      }.getOrElse {
        request.session - SessionKeys.failLoadPlayer
      }

      val updatedRequest = new WrappedRequest[AnyContent](request) {
        override lazy val session = updatedSession
      }

      block(PlayerJsRequest(isSecure, updatedRequest, errors))
  }
}

