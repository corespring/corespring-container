package org.corespring.container.client.integration

import org.corespring.container.client.V2PlayerConfig
import org.corespring.container.client.actions._
import org.corespring.container.client.component.ComponentUrls
import org.corespring.container.client.controllers.{ComponentsFileController, Icons, PlayerLauncher}
import org.corespring.container.client.controllers.apps._
import org.corespring.container.client.controllers.resources.{Item, Session}
import org.corespring.container.client.integration.validation.Validator
import org.corespring.container.components.model.Component
import org.corespring.container.components.model.dependencies.ComponentSplitter
import org.corespring.container.components.outcome.{DefaultScoreProcessor, ScoreProcessor, ScoreProcessorSequence}
import org.corespring.container.components.processing.PlayerItemPreProcessor
import org.corespring.container.components.response.OutcomeProcessor
import org.corespring.container.js.rhino.{RhinoOutcomeProcessor, RhinoPlayerItemPreProcessor}
import org.corespring.container.js.rhino.score.ItemJsScoreProcessor
import play.api.mvc.AnyContent

import scala.concurrent.ExecutionContext

trait DefaultIntegration
  extends ContainerControllers
  with ComponentSplitter
  with HasActions
  with HasHooks
  with HasConfig
  with HasProcessors {

  def validate: Either[String, Boolean] = {
    val componentsPath = configuration.getString("components.path").getOrElse("components")
    Validator.absolutePathInProdMode(componentsPath)
  }

  override def playerItemPreProcessor: PlayerItemPreProcessor = new RhinoPlayerItemPreProcessor(uiComponents, libraries)

  override def scoreProcessor: ScoreProcessor = new ScoreProcessorSequence(DefaultScoreProcessor, ItemJsScoreProcessor)

  override def outcomeProcessor: OutcomeProcessor = new RhinoOutcomeProcessor(DefaultIntegration.this.components)

  lazy val rig = new Rig {

    override def components = DefaultIntegration.this.components

    override def urls: ComponentUrls = componentUrls
  }

  lazy val icons = new Icons {
    def loadedComponents: Seq[Component] = DefaultIntegration.this.components
  }

  lazy val libs = new ComponentsFileController {
    def componentsPath: String = configuration.getString("components.path").getOrElse("components")

    def defaultCharSet: String = configuration.getString("default.charset").getOrElse("utf-8")
  }

  lazy val editor = new Editor {

    override def urls: ComponentUrls = componentUrls

    override def components: Seq[Component] = DefaultIntegration.this.components

    override def actions = editorActions
  }

  lazy val catalog = new Catalog {
    override def urls: ComponentUrls = componentUrls
    override def components = DefaultIntegration.this.components
    override def actions = catalogActions
  }

  lazy val player = new Player {

    override def urls: ComponentUrls = componentUrls

    override def components: Seq[Component] = DefaultIntegration.this.components

    override def actions: PlayerActions[AnyContent] = playerActions
  }

  lazy val item = new Item {
    def scoreProcessor: ScoreProcessor = DefaultIntegration.this.scoreProcessor

    def outcomeProcessor: OutcomeProcessor = DefaultIntegration.this.outcomeProcessor

    override def hooks: ItemHooks = itemHooks

    override implicit def ec: ExecutionContext = scala.concurrent.ExecutionContext.Implicits.global
  }

  lazy val session = new Session {

    override def hooks: SessionHooks = sessionHooks

    def outcomeProcessor = DefaultIntegration.this.outcomeProcessor

    def itemPreProcessor: PlayerItemPreProcessor = DefaultIntegration.this.playerItemPreProcessor

    def scoreProcessor: ScoreProcessor = DefaultIntegration.this.scoreProcessor

    override implicit def ec: ExecutionContext = scala.concurrent.ExecutionContext.Implicits.global
  }

  lazy val playerLauncher = new PlayerLauncher {
    def actions: PlayerLauncherActions[AnyContent] = playerLauncherActions

    override def playerConfig: V2PlayerConfig = V2PlayerConfig(configuration)
  }

}

