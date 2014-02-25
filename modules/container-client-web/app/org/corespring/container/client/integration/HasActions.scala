package org.corespring.container.client.integration

import org.corespring.container.client.actions._
import play.api.mvc.AnyContent
import play.api.Configuration
import org.corespring.container.components.response.OutcomeProcessor
import org.corespring.container.components.processing.PlayerItemPreProcessor
import org.corespring.container.components.outcome.ScoreProcessor

trait HasActions {
  def editorActions: EditorActions[AnyContent]

  def playerActions: PlayerActions[AnyContent]

  def itemActions: ItemActions[AnyContent]

  def sessionActions: SessionActions[AnyContent]

  def playerLauncherActions: PlayerLauncherActions[AnyContent]
}

trait HasConfig {
  def configuration: Configuration
}

trait HasProcessors {

  def outcomeProcessor: OutcomeProcessor
  def playerItemPreProcessor: PlayerItemPreProcessor
  def scoreProcessor: ScoreProcessor
}
