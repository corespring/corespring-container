package org.corespring.container.client.integration

import java.net.URL

import com.softwaremill.macwire.MacwireMacros.wire
import grizzled.slf4j.Logger
import org.corespring.container.client.{V2PlayerConfig, VersionInfo}
import org.corespring.container.client.component.{ComponentUrls, _}
import org.corespring.container.client.controllers._
import org.corespring.container.client.controllers.apps._
import org.corespring.container.client.controllers.helpers.LoadClientSideDependencies
import org.corespring.container.client.controllers.launcher.JsBuilder
import org.corespring.container.client.controllers.launcher.editor.EditorLauncher
import org.corespring.container.client.controllers.launcher.player.PlayerLauncher
import org.corespring.container.client.controllers.resources._
import org.corespring.container.client.controllers.resources.session.ItemPruner
import org.corespring.container.client.hooks._
import org.corespring.container.client.integration.validation.Validator
import org.corespring.container.client.io.ResourcePath
import org.corespring.container.client.pages.ComponentEditorRenderer
import org.corespring.container.client.pages.engine.{JadeEngine, JadeEngineConfig}
import org.corespring.container.client.pages.processing.AssetPathProcessor
import org.corespring.container.components.model.Component
import org.corespring.container.components.model.dependencies.{ComponentSplitter, DependencyResolver}
import org.corespring.container.components.outcome.{DefaultScoreProcessor, ScoreProcessor, ScoreProcessorSequence}
import org.corespring.container.components.processing.PlayerItemPreProcessor
import org.corespring.container.components.response.OutcomeProcessor
import org.corespring.container.js.rhino.score.CustomScoreProcessor
import org.corespring.container.js.rhino.{RhinoOutcomeProcessor, RhinoPlayerItemPreProcessor, RhinoScopeBuilder, RhinoServerLogic}
import org.corespring.container.logging.ContainerLogger
import play.api.Mode.Mode
import play.api.libs.json.{JsObject, JsValue}
import play.api.{Mode, Play}

import scala.concurrent.ExecutionContext

case class ContainerExecutionContext(context: ExecutionContext)


trait DefaultIntegration
  extends ContainerControllers
  with NewControllersModule
  with ComponentSplitter
  with HasHooks
  with HasConfig
  with HasProcessors {


  override def controllers = super.controllers ++ newEditorControllers

  private[DefaultIntegration] val debounceInMillis: Long = configuration.getLong("editor.autosave.debounceInMillis").getOrElse(5000)

  def jadeEngineConfig: JadeEngineConfig = JadeEngineConfig("container-client/jade", mode, resourceLoader.loadPath(_), resourceLoader.lastModified(_))

  def mode: Mode

  def containerContext: ContainerExecutionContext

  override lazy val componentService: ComponentService = new DefaultComponentService(mode, components)

  val loadResource: String => Option[URL]

  lazy val resourceLoader = new ResourcePath(loadResource)
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

  protected val internalProcessor: PlayerItemPreProcessor = new PlayerItemPreProcessor with ItemPruner {

    override def preProcessItemForPlayer(item: JsValue): JsValue = {
      val compProcessed = playerItemPreProcessor.preProcessItemForPlayer(item)
      pruneItem(compProcessed)
    }

    override def logger: Logger = DefaultIntegration.this.logger
  }

  override def playerItemPreProcessor: PlayerItemPreProcessor = new RhinoPlayerItemPreProcessor(DefaultIntegration.this.components, scopeBuilder.scope)

  /**
   * Plug isScoreable into the components js server logic.
   */
  private[DefaultIntegration] lazy val mainScoreProcessor = new DefaultScoreProcessor {
    override def isComponentScoreable(compType: String, comp: JsValue, session: JsValue, outcome: JsValue): Boolean = {
      val serverLogic = new RhinoServerLogic(compType, scopeBuilder.scope)
      serverLogic.isScoreable(comp, session, outcome)
    }
  }

  override lazy val scoreProcessor: ScoreProcessor = new ScoreProcessorSequence(mainScoreProcessor, CustomScoreProcessor)

  private[DefaultIntegration] lazy val prodScopeBuilder = new RhinoScopeBuilder(DefaultIntegration.this.components)

  private[DefaultIntegration] lazy val prodProcessor = new RhinoOutcomeProcessor(DefaultIntegration.this.components, scopeBuilder.scope)

  private lazy val playerConfig: V2PlayerConfig = V2PlayerConfig(configuration)

  def scopeBuilder = if (mode == Mode.Prod) {
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
    override def assetPathProcessor: AssetPathProcessor = DefaultIntegration.this.assetPathProcessor

    override def pageSourceService: PageSourceService = DefaultIntegration.this.pageSourceService

    override def mode: Mode = DefaultIntegration.this.mode

    override def containerContext = DefaultIntegration.this.containerContext

    override def components = DefaultIntegration.this.components

    override def urls: ComponentUrls = componentSets
  }

  lazy val icons = new Icons {
    def components: Seq[Component] = DefaultIntegration.this.components

    override def containerContext: ContainerExecutionContext = DefaultIntegration.this.containerContext
  }

  lazy val libs = new ComponentsFileController {

    def componentsPath: String = configuration.getString("components.path").getOrElse("components")

    def defaultCharSet: String = configuration.getString("default.charset").getOrElse("utf-8")

    override def containerContext: ContainerExecutionContext = DefaultIntegration.this.containerContext
  }

  lazy val assetPathProcessor = new AssetPathProcessor {

    val needsResolution = Seq(
      "components/",
      "component-sets/",
      "editor",
      "-prod",
      "player.min")

    override def process(s: String): String = {
      if (needsResolution.exists(s.contains(_))) resolveDomain(s) else s
    }
  }

  lazy val pageSourceServiceConfig: PageSourceServiceConfig = PageSourceServiceConfig(
    v2Player.Routes.prefix,
    mode == Mode.Dev,
    resourceLoader.loadPath(_))

  lazy val pageSourceService: PageSourceService = wire[JsonPageSourceService]

  lazy val componentJson: ComponentJson = new ComponentInfoJson(v2Player.Routes.prefix)

  lazy val dependencyResolver: DependencyResolver = new DependencyResolver {
    override def components: Seq[Component] = DefaultIntegration.this.components
  }

  lazy val clientSideDependencies: LoadClientSideDependencies = new LoadClientSideDependencies {}

  lazy val componentBundler: ComponentBundler = new DefaultComponentBundler(dependencyResolver, clientSideDependencies, componentSets)

  lazy val jadeEngine = wire[JadeEngine]

  lazy val jsBuilder = new JsBuilder(resourceLoader.loadPath(_))

  /** TODO: Use macwire for the dependencies below.*/
//  lazy val itemEditor = new ItemEditor {
//
//    override def componentJson = DefaultIntegration.this.componentJson
//
//    override def pageSourceService: PageSourceService = DefaultIntegration.this.pageSourceService
//
//    override def renderer: ComponentEditorRenderer = DefaultIntegration.this.componentEditorRenderer
//
//    override def bundler: ComponentBundler = DefaultIntegration.this.componentBundler
//
//    override val debounceInMillis = DefaultIntegration.this.debounceInMillis
//    override def assetPathProcessor: AssetPathProcessor = DefaultIntegration.this.assetPathProcessor
//
//    override def versionInfo: JsObject = DefaultIntegration.this.versionInfo.json
//
//    override def mode: Mode = DefaultIntegration.this.mode
//
//    override def containerContext = DefaultIntegration.this.containerContext
//
//    override def urls: ComponentUrls = componentSets
//
//    override def components: Seq[Component] = DefaultIntegration.this.components
//
//    override def resolveDomain(path: String): String = DefaultIntegration.this.resolveDomain(path)
//
//    override def hooks: EditorHooks = itemEditorHooks
//  }

//  lazy val itemDevEditor = new ItemDevEditor {
//    override def componentJson = DefaultIntegration.this.componentJson
//    override def assetPathProcessor: AssetPathProcessor = DefaultIntegration.this.assetPathProcessor
//    override def pageSourceService: PageSourceService = DefaultIntegration.this.pageSourceService
//
//    override def renderer: ComponentEditorRenderer = DefaultIntegration.this.componentEditorRenderer
//
//    override def bundler: ComponentBundler = DefaultIntegration.this.componentBundler
//    override def versionInfo: JsObject = DefaultIntegration.this.versionInfo
//
//    override def mode: Mode = DefaultIntegration.this.mode
//
//    override def containerContext = DefaultIntegration.this.containerContext
//
//    override def urls: ComponentUrls = componentSets
//
//    override def components: Seq[Component] = DefaultIntegration.this.components
//
//    override def resolveDomain(path: String): String = DefaultIntegration.this.resolveDomain(path)
//
//    override def hooks: EditorHooks = itemEditorHooks
//  }

//  lazy val draftEditor = new DraftEditor {
//    override def componentJson = DefaultIntegration.this.componentJson
//    override def assetPathProcessor: AssetPathProcessor = DefaultIntegration.this.assetPathProcessor
//    override def pageSourceService: PageSourceService = DefaultIntegration.this.pageSourceService
//    override def renderer: ComponentEditorRenderer = DefaultIntegration.this.componentEditorRenderer
//
//    override def bundler: ComponentBundler = DefaultIntegration.this.componentBundler
//
//    override val debounceInMillis = DefaultIntegration.this.debounceInMillis
//
//    override def versionInfo: JsObject = DefaultIntegration.this.versionInfo
//
//    override def mode: Mode = DefaultIntegration.this.mode
//
//    override def containerContext = DefaultIntegration.this.containerContext
//
//    override def urls: ComponentUrls = componentSets
//
//    override def components: Seq[Component] = DefaultIntegration.this.components
//
//    override def hooks = draftEditorHooks
//
//    override def resolveDomain(path: String): String = DefaultIntegration.this.resolveDomain(path)
//  }

//  lazy val draftDevEditor = new DraftDevEditor {
//    override def componentJson = DefaultIntegration.this.componentJson
//    override def assetPathProcessor: AssetPathProcessor = DefaultIntegration.this.assetPathProcessor
//    override def pageSourceService: PageSourceService = DefaultIntegration.this.pageSourceService
//    override def renderer: ComponentEditorRenderer = DefaultIntegration.this.componentEditorRenderer
//
//    override def bundler: ComponentBundler = DefaultIntegration.this.componentBundler
//    override def mode: Mode = DefaultIntegration.this.mode
//
//    override def containerContext = DefaultIntegration.this.containerContext
//
//    override def urls: ComponentUrls = componentSets
//
//    override def components: Seq[Component] = DefaultIntegration.this.components
//
//    override def hooks = draftEditorHooks
//
//    override def resolveDomain(path: String): String = DefaultIntegration.this.resolveDomain(path)
//
//    override def versionInfo: JsObject = DefaultIntegration.this.versionInfo
//  }

  lazy val catalog = new Catalog {
    override def assetPathProcessor: AssetPathProcessor = DefaultIntegration.this.assetPathProcessor
    override def pageSourceService: PageSourceService = DefaultIntegration.this.pageSourceService

    override def mode: Mode = DefaultIntegration.this.mode
    override def containerContext = DefaultIntegration.this.containerContext

    override def urls: ComponentUrls = componentSets
    override def components = DefaultIntegration.this.components
    override def hooks = catalogHooks

    override def resolveDomain(path: String): String = DefaultIntegration.this.resolveDomain(path)
  }

  lazy val prodHtmlPlayer = new Player {
    override def assetPathProcessor: AssetPathProcessor = DefaultIntegration.this.assetPathProcessor
    override def pageSourceService: PageSourceService = DefaultIntegration.this.pageSourceService

    override def versionInfo: JsObject = DefaultIntegration.this.versionInfo.json

    override def mode: Mode = DefaultIntegration.this.mode

    override def containerContext = DefaultIntegration.this.containerContext

    override def urls: ComponentUrls = componentSets

    override def playerConfig: V2PlayerConfig = DefaultIntegration.this.playerConfig

    override def components: Seq[Component] = DefaultIntegration.this.components

    override def hooks = playerHooks

    override def resolveDomain(path: String): String = DefaultIntegration.this.resolveDomain(path)

    override def itemPreProcessor: PlayerItemPreProcessor = DefaultIntegration.this.internalProcessor
  }

  lazy val metadata = new ItemMetadata {
    override def hooks: ItemMetadataHooks = itemMetadataHooks

    override def containerContext = DefaultIntegration.this.containerContext
  }

  lazy val collection = new Collection {
    override def hooks: CollectionHooks = collectionHooks

    override def containerContext = DefaultIntegration.this.containerContext
  }

  lazy val item = new Item {

    override def components: Seq[Component] = DefaultIntegration.this.components

    override def hooks: CoreItemHooks with CreateItemHook = itemHooks

    override def componentTypes: Seq[String] = DefaultIntegration.this.components.map(_.componentType)

    override def containerContext = DefaultIntegration.this.containerContext

    override def materialHooks: SupportingMaterialHooks = DefaultIntegration.this.itemSupportingMaterialHooks
  }

  lazy val itemDraft = new ItemDraft {

    override def components: Seq[Component] = DefaultIntegration.this.components

    override def materialHooks: SupportingMaterialHooks = DefaultIntegration.this.itemDraftSupportingMaterialHooks

    def scoreProcessor: ScoreProcessor = DefaultIntegration.this.scoreProcessor

    def outcomeProcessor: OutcomeProcessor = DefaultIntegration.this.outcomeProcessor

    override def hooks: CoreItemHooks with DraftHooks = itemDraftHooks

    override def containerContext = DefaultIntegration.this.containerContext

    override protected def componentTypes: Seq[String] = DefaultIntegration.this.components.map(_.componentType)
  }

  lazy val session = new Session {

    override def sessionContext = SessionExecutionContext(
      DefaultIntegration.this.containerContext.context,
      DefaultIntegration.this.containerContext.context)

    override def hooks: SessionHooks = sessionHooks

    def outcomeProcessor = DefaultIntegration.this.outcomeProcessor

    def itemPreProcessor: PlayerItemPreProcessor = DefaultIntegration.this.internalProcessor

    def scoreProcessor: ScoreProcessor = DefaultIntegration.this.scoreProcessor
  }

  lazy val playerLauncher = new PlayerLauncher {

    override def builder: JsBuilder = DefaultIntegration.this.jsBuilder

    override def containerContext = DefaultIntegration.this.containerContext

    def hooks = playerLauncherHooks

    override def playerConfig: V2PlayerConfig = DefaultIntegration.this.playerConfig
  }

  lazy val editorLauncher = new EditorLauncher {
    override def builder: JsBuilder = DefaultIntegration.this.jsBuilder
    override def containerContext = DefaultIntegration.this.containerContext
    def hooks = playerLauncherHooks
    override def playerConfig: V2PlayerConfig = DefaultIntegration.this.playerConfig
  }

  override def dataQuery: DataQuery = new DataQuery {
    override def hooks: DataQueryHooks = dataQueryHooks

    override def containerContext = DefaultIntegration.this.containerContext
  }

}
