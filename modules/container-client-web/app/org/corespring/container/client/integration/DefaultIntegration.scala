package org.corespring.container.client.integration

import org.corespring.container.client.V2PlayerConfig
import org.corespring.container.client.actions._
import org.corespring.container.client.component.ComponentUrls
import org.corespring.container.client.controllers.apps._
import org.corespring.container.client.controllers.resources.{ Session, Item }
import org.corespring.container.client.controllers.{ PlayerLauncher, ComponentsFileController, Icons }
import org.corespring.container.client.integration.validation.Validator
import org.corespring.container.components.model.Component
import org.corespring.container.components.model.dependencies.ComponentSplitter
import org.corespring.container.components.outcome.{ DefaultScoreProcessor, ScoreProcessorSequence, ScoreProcessor }
import org.corespring.container.components.processing.PlayerItemPreProcessor
import org.corespring.container.components.response.OutcomeProcessor
import org.corespring.container.js.rhino.score.ItemJsScoreProcessor
import org.corespring.container.js.rhino.{ RhinoOutcomeProcessor, RhinoPlayerItemPreProcessor }
import play.api.mvc.AnyContent

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

  def callCreator: CallCreator

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

    override def callCreator: CallCreator = DefaultIntegration.this.callCreator

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

    override def callCreator: CallCreator = DefaultIntegration.this.callCreator

    override def urls: ComponentUrls = componentUrls

    override def components: Seq[Component] = DefaultIntegration.this.components

    override def actions: PlayerActions[AnyContent] = playerActions
  }

  lazy val item = new Item {
    def scoreProcessor: ScoreProcessor = DefaultIntegration.this.scoreProcessor

    def outcomeProcessor: OutcomeProcessor = DefaultIntegration.this.outcomeProcessor

    override def hooks: ItemHooks = itemHooks
  }

  lazy val session = new Session {

    override def actions: SessionActions[AnyContent] = sessionActions

    def outcomeProcessor = DefaultIntegration.this.outcomeProcessor

    def itemPreProcessor: PlayerItemPreProcessor = DefaultIntegration.this.playerItemPreProcessor

    def scoreProcessor: ScoreProcessor = DefaultIntegration.this.scoreProcessor
  }

  lazy val playerLauncher = new PlayerLauncher {
    def actions: PlayerLauncherActions[AnyContent] = playerLauncherActions

    override def playerConfig: V2PlayerConfig = V2PlayerConfig(configuration)
  }

}

