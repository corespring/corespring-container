package org.corespring.shell.impl

import org.corespring.amazon.s3.ConcreteS3Service
import org.corespring.container.client.controllers.{ComponentsFileController, Rig, Icons, Assets}
import org.corespring.container.components.model.{Library, UiComponent, Component}
import org.corespring.container.components.outcome.{ItemJsOutcomeProcessor, OutcomeProcessorSequence, DefaultOutcomeProcessor, OutcomeProcessor}
import org.corespring.container.components.response.{ResponseProcessorImpl, ResponseProcessor}
import org.corespring.shell.impl.controllers.editor.{ClientItemImpl, EditorHooksImpl}
import org.corespring.shell.impl.controllers.player.{ClientSessionImpl, PlayerHooksImpl}
import org.corespring.shell.impl.services.MongoService
import play.api.Configuration
import play.api.mvc._

class ContainerClientImplementation(
                                     itemServiceIn : MongoService,
                                     sessionServiceIn : MongoService,
                                     comps : => Seq[Component],
                                     config : Configuration
                                     ) {

  lazy val controllers: Seq[Controller] = Seq(playerHooks, editorHooks, items, sessions, assets, icons, rig, libs)

  def rootUiComponents = comps.filter(_.isInstanceOf[UiComponent]).map(_.asInstanceOf[UiComponent])
  def rootLibs = comps.filter(_.isInstanceOf[Library]).map(_.asInstanceOf[Library])

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

    def loadAsset(id: String, file: String)(request: Request[AnyContent]): Result = {
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
  }

  private lazy val sessions = new ClientSessionImpl {
    def itemService: MongoService = itemServiceIn

    def responseProcessor: ResponseProcessor = new ResponseProcessorImpl(rootUiComponents, rootLibs)

    def sessionService: MongoService = sessionServiceIn

    def outcomeProcessor: OutcomeProcessor = new OutcomeProcessorSequence(DefaultOutcomeProcessor, ItemJsOutcomeProcessor)

  }
}
