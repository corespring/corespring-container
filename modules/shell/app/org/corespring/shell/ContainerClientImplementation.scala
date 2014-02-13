package org.corespring.shell

import org.corespring.amazon.s3.ConcreteS3Service
import org.corespring.container.client.V2PlayerConfig
import org.corespring.container.client.actions.{ClientActions, PlayerActions, EditorActions => ContainerEditorActions, PlayerJsRequest, PlayerLauncherActions}
import org.corespring.container.client.component.{ComponentUrls, EditorGenerator, SourceGenerator, PlayerGenerator}
import org.corespring.container.client.controllers._
import org.corespring.container.client.controllers.angular.AngularModules
import org.corespring.container.client.controllers.hooks.PlayerHooks
import org.corespring.container.components.model.Component
import org.corespring.container.components.model.Library
import org.corespring.container.components.model.UiComponent
import org.corespring.container.components.outcome.{ItemJsScoreProcessor, ScoreProcessorSequence, DefaultScoreProcessor, ScoreProcessor}
import org.corespring.container.components.processing.rhino.PlayerItemPreProcessor
import org.corespring.container.components.response.rhino.OutcomeProcessor
import org.corespring.mongo.json.services.MongoService
import org.corespring.shell.controllers.editor.actions.EditorActions
import org.corespring.shell.controllers.editor.{Item, EditorHooks}
import org.corespring.shell.controllers.player.Session
import org.corespring.shell.controllers.player.actions.{PlayerActions => ShellPlayerActions}
import play.api.Configuration
import play.api.mvc._
import scala.Some
import org.corespring.container.client.cache.ContainerCache

class ContainerClientImplementation(
                                     itemServiceIn: MongoService,
                                     sessionServiceIn: MongoService,
                                     comps: => Seq[Component],
                                     rootConfig: Configuration
                                     ) {

  lazy val controllers: Seq[Controller] = Seq(newEditor, newPlayer, componentSets, playerHooks, editorHooks, items, sessions, assets, icons, rig, libs, playerLauncher)

  def rootUiComponents = comps.filter(_.isInstanceOf[UiComponent]).map(_.asInstanceOf[UiComponent])

  def rootLibs = comps.filter(_.isInstanceOf[Library]).map(_.asInstanceOf[Library])


  private lazy val playerLauncher = new PlayerLauncher {

    override def playerConfig: V2PlayerConfig = V2PlayerConfig(rootConfig)

    def builder: PlayerLauncherActions[AnyContent] = new PlayerLauncherActions[AnyContent] {

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

      private def loadJs(block: PlayerJsRequest[AnyContent] => Result): Action[AnyContent] = Action {
        request =>
          def isSecure = request.getQueryString("secure").map {
            _ == "true"
          }.getOrElse(false)
          def errors = request.getQueryString("jsErrors").map {
            s => s.split(",").toSeq
          }.getOrElse(Seq())
          val r = block(PlayerJsRequest(isSecure, request, errors))
          request.getQueryString("pageErrors").map {
            s =>
              r.withSession(SessionKeys.failLoadPlayer -> s)
          }.getOrElse(r.withNewSession)

      }
    }
  }

  private lazy val icons = new Icons {
    def loadedComponents: Seq[Component] = comps
  }

  private lazy val libs = new ComponentsFileController {
    def componentsPath: String = rootConfig.getString("components.path").getOrElse("components")

    def defaultCharSet: String = rootConfig.getString("default.charset").getOrElse("utf-8")
  }

  private lazy val rig = new Rig {

    override def name = "rig"

    override def loadedComponents = comps

    override def uiComponents: Seq[UiComponent] = rootUiComponents
  }

  private lazy val assets = new Assets {

    private lazy val key = rootConfig.getString("amazon.s3.key")
    private lazy val secret = rootConfig.getString("amazon.s3.secret")
    private lazy val bucket = rootConfig.getString("amazon.s3.bucket").getOrElse(throw new RuntimeException("No bucket specified"))

    lazy val playS3 = {
      val out = for {
        k <- key
        s <- secret
      } yield {
        new ConcreteS3Service(k, s)
      }
      out.getOrElse(throw new RuntimeException("No amazon key/secret"))
    }

    def loadAsset(id: String, file: String)(request: Request[AnyContent]): SimpleResult = {
      playS3.download(bucket, s"$id/$file", Some(request.headers))
    }

    //TODO: Need to look at a way of pre-validating before we upload - look at the predicate?
    def uploadBodyParser(id: String, file: String): BodyParser[Int] = playS3.upload(bucket, s"$id/$file", (rh) => None)

    def getItemId(sessionId: String): Option[String] = sessionServiceIn.load(sessionId).map {
      json => (json \ "itemId").as[String]
    }
  }

  private lazy val appCache = new ContainerCache {

    import scala.collection.mutable

    private val data: mutable.Map[String, String] = mutable.Map()

    override def has(key: String): Boolean = data.contains(key)

    override def remove(key: String): Unit = data.remove(key)

    override def get(key: String): Option[String] = data.get(key)

    override def set(key: String, value: String): Unit = data.put(key, value)
  }

  private lazy val componentSets = new ComponentSets {
    override def cache: ContainerCache = appCache
  }

  private lazy val typeRouter = new ComponentUrls {
    override def cache: ContainerCache = appCache

    /** return a url where this hashed asset is available */
    override protected def cssPath(hash: String): String = org.corespring.container.client.controllers.routes.ComponentSets.resource(hash, "css").url

    /** return a url where this hashed asset is available */
    override protected def jsPath(hash: String): String = org.corespring.container.client.controllers.routes.ComponentSets.resource(hash, "js").url
  }

  private lazy val newPlayer = new Player {

    override def urls: ComponentUrls = typeRouter

    override def components: Seq[Component] = comps

    override def actions: PlayerActions[AnyContent] = new ShellPlayerActions {
      override def sessionService: MongoService = sessionServiceIn

      override def itemService: MongoService = itemServiceIn
    }

    override def ngModules: AngularModules = new AngularModules("player.services")

    override def generator: PlayerGenerator = new PlayerGenerator

    override def cache: ContainerCache = appCache
  }


  private lazy val playerHooks = new PlayerHooks {

    def loadedComponents: Seq[Component] = comps

    override def actions: PlayerActions[AnyContent] = new ShellPlayerActions {
      override def sessionService: MongoService = sessionServiceIn

      override def itemService: MongoService = itemServiceIn
    }
  }

  private lazy val newEditor = new Editor {

    override def generator: SourceGenerator = new EditorGenerator

    override def urls: ComponentUrls = typeRouter

    override def components: Seq[Component] = comps

    override def ngModules: AngularModules = new AngularModules("editor.services")

    override def actions: ClientActions[AnyContent] = new EditorActions {
      override def itemService: MongoService = itemServiceIn
    }

    override def cache: ContainerCache = appCache
  }

  private lazy val editorHooks = new EditorHooks {
    def itemService: MongoService = itemServiceIn

    def loadedComponents: Seq[Component] = comps

    override def actions: ContainerEditorActions[AnyContent] = new EditorActions {
      override def itemService: MongoService = itemServiceIn
    }
  }

  private lazy val items = new Item {
    def itemService: MongoService = itemServiceIn

    //TODO: Item level scoring isn't active at the moment, once it is we'll need to add ItemJsOutcomProcessor
    def scoreProcessor: ScoreProcessor = new ScoreProcessorSequence(DefaultScoreProcessor, ItemJsScoreProcessor)

    def outcomeProcessor = new OutcomeProcessor(rootUiComponents, rootLibs)
  }

  private lazy val sessions = new Session {
    def itemService: MongoService = itemServiceIn

    def outcomeProcessor = new OutcomeProcessor(rootUiComponents, rootLibs)

    def itemPreProcessor: PlayerItemPreProcessor = new PlayerItemPreProcessor(rootUiComponents, rootLibs)

    def sessionService: MongoService = sessionServiceIn

    def scoreProcessor: ScoreProcessor = new ScoreProcessorSequence(DefaultScoreProcessor, ItemJsScoreProcessor)

  }
}
