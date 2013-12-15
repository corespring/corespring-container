package org.corespring.shell.impl

import org.corespring.amazon.s3.ConcreteS3Service
import org.corespring.container.client.controllers._
import org.corespring.container.components.model.Component
import org.corespring.container.components.model.Library
import org.corespring.container.components.model.UiComponent
import org.corespring.container.components.outcome.{ItemJsScoreProcessor, ScoreProcessorSequence, DefaultScoreProcessor, ScoreProcessor}
import org.corespring.container.components.response.{OutcomeProcessorImpl, OutcomeProcessor}
import org.corespring.shell.impl.controllers.editor.{ClientItemImpl, EditorHooksImpl}
import org.corespring.shell.impl.controllers.player.{ClientSessionImpl, PlayerHooksImpl}
import play.api.Configuration
import play.api.mvc._
import scala.Some
import org.corespring.mongo.json.services.MongoService

class ContainerClientImplementation(
                                     itemServiceIn : MongoService,
                                     sessionServiceIn : MongoService,
                                     comps : => Seq[Component],
                                     config : Configuration
                                     ) {

  lazy val controllers: Seq[Controller] = Seq(playerHooks, editorHooks, items, sessions, assets, icons, rig, libs, playerLauncher)

  def rootUiComponents = comps.filter(_.isInstanceOf[UiComponent]).map(_.asInstanceOf[UiComponent])
  def rootLibs = comps.filter(_.isInstanceOf[Library]).map(_.asInstanceOf[Library])

  private lazy val playerLauncher = new PlayerLauncher {
    override def isSecure(r:Request[AnyContent]) = r.getQueryString("secure").map{ _ == "true"}.getOrElse(false)
  }

  private lazy val icons = new Icons {
    def loadedComponents: Seq[Component] = comps
  }

  private lazy val libs = new ComponentsFileController {
    def componentsPath: String = config.getString("components.path").getOrElse("components")
    def defaultCharSet: String = config.getString("default.charset").getOrElse("utf-8")
}

  private lazy val rig = new Rig{
    def uiComponents: Seq[UiComponent] = rootUiComponents
  }

  private lazy val assets = new Assets {

    private lazy val key = config.getString("amazon.s3.key")
    private lazy val secret = config.getString("amazon.s3.secret")
    private lazy val bucket = config.getString("amazon.s3.bucket").getOrElse(throw new RuntimeException("No bucket specified"))

    lazy val playS3 = {
      val out = for{
        k <- key
        s <- secret
      } yield {
        new ConcreteS3Service(k,s)
      }
      out.getOrElse(throw new RuntimeException("No amazon key/secret"))
    }

    def loadAsset(id: String, file: String)(request: Request[AnyContent]): SimpleResult = {
      playS3.download(bucket, s"$id/$file", Some(request.headers))
    }

    //TODO: Need to look at a way of pre-validating before we upload - look at the predicate?
    def uploadBodyParser(id: String, file: String): BodyParser[Int] = playS3.upload(bucket, s"$id/$file", (rh) => None)

    def getItemId(sessionId: String): Option[String] = sessionServiceIn.load(sessionId).map{ json => (json \ "itemId").as[String] }
  }

  private lazy val playerHooks = new PlayerHooksImpl {

    def itemService: MongoService = itemServiceIn

    def loadedComponents: Seq[Component] = comps

    def sessionService: MongoService = sessionServiceIn
  }

  private lazy val editorHooks = new EditorHooksImpl {
    def itemService: MongoService = itemServiceIn

    def loadedComponents: Seq[Component] = comps
  }

  private lazy val items = new ClientItemImpl {
    def itemService: MongoService = itemServiceIn

    //TODO: Item level scoring isn't active at the moment, once it is we'll need to add ItemJsOutcomProcessor
    def scoreProcessor: ScoreProcessor = DefaultScoreProcessor //new OutcomeProcessorSequence(DefaultOutcomeProcessor, ItemJsOutcomeProcessor)
    def outcomeProcessor: OutcomeProcessor = new OutcomeProcessorImpl(rootUiComponents, rootLibs)
  }

  private lazy val sessions = new ClientSessionImpl {
    def itemService: MongoService = itemServiceIn

    def outcomeProcessor: OutcomeProcessor = new OutcomeProcessorImpl(rootUiComponents, rootLibs)

    def sessionService: MongoService = sessionServiceIn

    def scoreProcessor: ScoreProcessor = new ScoreProcessorSequence(DefaultScoreProcessor, ItemJsScoreProcessor)

  }
}
