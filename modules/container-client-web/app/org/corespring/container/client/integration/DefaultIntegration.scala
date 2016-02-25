package org.corespring.container.client.integration

import java.net.URL

import com.softwaremill.macwire.MacwireMacros.wire
import org.corespring.container.client.V2PlayerConfig
import org.corespring.container.client.component._
import org.corespring.container.client.controllers._
import org.corespring.container.client.controllers.apps._
import org.corespring.container.client.controllers.helpers.{LoadClientSideDependencies}
import org.corespring.container.client.controllers.launcher.JsBuilder
import org.corespring.container.client.controllers.launcher.editor.EditorLauncher
import org.corespring.container.client.controllers.launcher.player.PlayerLauncher
import org.corespring.container.client.controllers.resources._
import org.corespring.container.client.hooks._
import org.corespring.container.client.integration.validation.Validator
import org.corespring.container.client.io.ResourcePath
import org.corespring.container.client.pages.engine.{JadeEngine, JadeEngineConfig}
import org.corespring.container.client.pages.processing.AssetPathProcessor
import org.corespring.container.components.model.Component
import org.corespring.container.components.model.dependencies.{ComponentSplitter, DependencyResolver}
import org.corespring.container.js.{JsProcessingConfig, JsProcessingModule}
import org.corespring.container.logging.ContainerLogger
import play.api.Mode.Mode
import play.api.{Mode}

import scala.concurrent.ExecutionContext

case class ContainerExecutionContext(context: ExecutionContext)

trait DefaultIntegration
  extends ContainerControllers
  with NewControllersModule
  with ComponentSplitter
  with HasHooks
  with HasConfig
  with ResourcesModule
  with JsProcessingModule {

  override lazy val controllers = super.controllers ++ newEditorControllers ++ resourceControllers

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

  override def jsProcessingConfig: JsProcessingConfig = JsProcessingConfig(mode == Mode.Dev)

  lazy val playerConfig: V2PlayerConfig = V2PlayerConfig(configuration)

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

  //TODO: wire when we've cleaned up
  lazy val componentBundler: ComponentBundler = new DefaultComponentBundler(dependencyResolver, clientSideDependencies, componentSets, componentService)

  lazy val jadeEngine = wire[JadeEngine]

  lazy val jsBuilder = new JsBuilder(resourceLoader.loadPath(_))

  override def sessionExecutionContext = SessionExecutionContext(
    DefaultIntegration.this.containerContext.context,
    DefaultIntegration.this.containerContext.context)


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
