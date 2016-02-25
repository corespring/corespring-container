package org.corespring.container.js

import com.softwaremill.macwire.MacwireMacros.wire
import org.corespring.container.components.model.Component
import org.corespring.container.components.outcome.ScoreProcessorSequence
import org.corespring.container.js.outcome.RhinoDefaultScoreProcessor
import org.corespring.container.js.rhino.score.CustomScoreProcessor
import org.corespring.container.js.rhino.{RhinoScopeBuilder, RhinoServerLogic, RhinoPlayerItemPreProcessor, RhinoOutcomeProcessor}
import org.corespring.container.{components => interface}
import org.mozilla.javascript.Scriptable

/**
  *
  * @param reloadScope - useful for development - don't use in prod
  */
case class JsProcessingConfig(reloadScope:Boolean)

trait JsProcessingModule {

  def jsProcessingConfig : JsProcessingConfig

  def components : Seq[Component]

  private lazy val fixedScopeBuilder = new RhinoScopeBuilder(components)

  protected def scope : Scriptable = {
    if(jsProcessingConfig.reloadScope){
      new RhinoScopeBuilder(components).scope
    } else {
      fixedScopeBuilder.scope
    }
  }

  lazy val rhinoServerLogic : RhinoServerLogic = wire[RhinoServerLogic]
  private lazy val mainScoreProcessor : RhinoDefaultScoreProcessor = wire[RhinoDefaultScoreProcessor]
  lazy val scoreProcessor: interface.outcome.ScoreProcessor = new ScoreProcessorSequence(mainScoreProcessor, CustomScoreProcessor)
  lazy val playerItemPreProcessor: interface.processing.PlayerItemPreProcessor = wire[RhinoPlayerItemPreProcessor]
  lazy val outcomeProcessor: interface.response.OutcomeProcessor = wire[RhinoOutcomeProcessor]
}
