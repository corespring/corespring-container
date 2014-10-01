package org.corespring.container.client.integration

import org.corespring.container.client.V2PlayerConfig
import org.corespring.container.client.component.ComponentUrls
import org.corespring.container.client.controllers.apps._
import org.corespring.container.client.controllers.resources.{ Item, Session }
import org.corespring.container.client.controllers.{ ComponentsFileController, DataQuery, Icons, PlayerLauncher }
import org.corespring.container.client.hooks._
import org.corespring.container.client.integration.validation.Validator
import org.corespring.container.components.model.Component
import org.corespring.container.components.model.dependencies.ComponentSplitter
import org.corespring.container.components.outcome.{ DefaultScoreProcessor, ScoreProcessor, ScoreProcessorSequence }
import org.corespring.container.components.processing.PlayerItemPreProcessor
import org.corespring.container.components.response.OutcomeProcessor
import org.corespring.container.js.rhino.score.CustomScoreProcessor
import org.corespring.container.js.rhino.{ RhinoServerLogic, RhinoScopeBuilder, RhinoOutcomeProcessor, RhinoPlayerItemPreProcessor }
import org.corespring.container.logging.ContainerLogger
import play.api.libs.json.JsValue
import play.api.{ Mode, Play }

import scala.concurrent.ExecutionContext

trait DefaultIntegration
  extends ContainerControllers
  with ComponentSplitter
  with HasHooks
  with HasConfig
  with HasProcessors {

  /**
   * For a given resource path return a resolved path.
   * By default this just returns the path, so no domain is used.
   * Override it if you want to make use of it.
   */
  def resolveDomain(path: String): String = path

  private lazy val logger = ContainerLogger.getLogger("DefaultIntegration")

  def validate: Either[String, Boolean] = {
    val componentsPath = configuration.getString("components.path").getOrElse("components")
    Validator.absolutePathInProdMode(componentsPath)
  }

  def showErrorInUi: Boolean = {
    Play.current.mode == Mode.Dev || configuration.getBoolean("showErrorInUi").getOrElse(false)
  }

  implicit def ec: ExecutionContext

  override def playerItemPreProcessor: PlayerItemPreProcessor = new RhinoPlayerItemPreProcessor(DefaultIntegration.this.components, scopeBuilder.scope)

  /**
   * Plug isScoreable into the components js server logic.
   */
  private lazy val mainScoreProcessor = new DefaultScoreProcessor {
    override def isComponentScoreable(compType: String, comp: JsValue, session: JsValue, outcome: JsValue): Boolean = {
      val serverLogic = new RhinoServerLogic(compType, scopeBuilder.scope)
      serverLogic.isScoreable(comp, session, outcome)
    }
  }

  override def scoreProcessor: ScoreProcessor = new ScoreProcessorSequence(mainScoreProcessor, CustomScoreProcessor)

  private lazy val prodScopeBuilder = new RhinoScopeBuilder(DefaultIntegration.this.components)

  private lazy val prodProcessor = new RhinoOutcomeProcessor(DefaultIntegration.this.components, scopeBuilder.scope)

  def scopeBuilder = if (Play.current.mode == Mode.Prod) {
    logger.trace("Prod RhinoScopeBuilder")
    prodScopeBuilder
  } else {
    logger.trace("Dev RhinoScopeBuilder")
    new RhinoScopeBuilder(DefaultIntegration.this.components)
  }

  def outcomeProcessor: OutcomeProcessor = if (Play.current.mode == Mode.Prod) {
    logger.trace("Prod OutcomeProcessor")
    prodProcessor
  } else {
    logger.trace("Dev OutcomeProcessor")
    new RhinoOutcomeProcessor(DefaultIntegration.this.components, scopeBuilder.scope)
  }

  lazy val rig = new Rig {
    override implicit def ec: ExecutionContext = DefaultIntegration.this.ec

    override def components = DefaultIntegration.this.components

    override def urls: ComponentUrls = componentSets
  }

  lazy val icons = new Icons {
    def components: Seq[Component] = DefaultIntegration.this.components
  }

  lazy val libs = new ComponentsFileController {
    def componentsPath: String = configuration.getString("components.path").getOrElse("components")

    def defaultCharSet: String = configuration.getString("default.charset").getOrElse("utf-8")
  }

  lazy val editor = new Editor {

    override def showErrorInUi: Boolean = DefaultIntegration.this.showErrorInUi

    override implicit def ec: ExecutionContext = DefaultIntegration.this.ec

    override def urls: ComponentUrls = componentSets

    override def components: Seq[Component] = DefaultIntegration.this.components

    override def hooks = editorHooks
  }

  lazy val catalog = new Catalog {

    override def showErrorInUi: Boolean = DefaultIntegration.this.showErrorInUi

    override implicit def ec: ExecutionContext = DefaultIntegration.this.ec

    override def urls: ComponentUrls = componentSets
    override def components = DefaultIntegration.this.components
    override def hooks = catalogHooks
  }

  lazy val jsonPlayer = new JsonPlayer {

    override def showErrorInUi: Boolean = DefaultIntegration.this.showErrorInUi

    override implicit def ec: ExecutionContext = DefaultIntegration.this.ec

    override def urls: ComponentUrls = componentSets

    override def components: Seq[Component] = DefaultIntegration.this.components

    override def hooks = playerHooks
  }

  lazy val prodHtmlPlayer = new ProdHtmlPlayer {

    override def showErrorInUi: Boolean = DefaultIntegration.this.showErrorInUi

    override implicit def ec: ExecutionContext = DefaultIntegration.this.ec

    override def urls: ComponentUrls = componentSets

    override def components: Seq[Component] = DefaultIntegration.this.components

    override def hooks = playerHooks

    override def resolveDomain(path: String): String = DefaultIntegration.this.resolveDomain(path)

    override def itemPreProcessor: PlayerItemPreProcessor = DefaultIntegration.this.playerItemPreProcessor
  }

  lazy val item = new Item {
    def scoreProcessor: ScoreProcessor = DefaultIntegration.this.scoreProcessor

    def outcomeProcessor: OutcomeProcessor = DefaultIntegration.this.outcomeProcessor

    override def hooks: ItemHooks = itemHooks

    override implicit def ec: ExecutionContext = DefaultIntegration.this.ec
  }

  lazy val session = new Session {

    override def hooks: SessionHooks = sessionHooks

    def outcomeProcessor = DefaultIntegration.this.outcomeProcessor

    def itemPreProcessor: PlayerItemPreProcessor = DefaultIntegration.this.playerItemPreProcessor

    def scoreProcessor: ScoreProcessor = DefaultIntegration.this.scoreProcessor
  }

  lazy val playerLauncher = new PlayerLauncher {
    override implicit def ec: ExecutionContext = DefaultIntegration.this.ec

    def hooks = playerLauncherHooks

    override def playerConfig: V2PlayerConfig = V2PlayerConfig(configuration)
  }

  override def dataQuery: DataQuery = new DataQuery {
    override def hooks: DataQueryHooks = dataQueryHooks
  }
}
