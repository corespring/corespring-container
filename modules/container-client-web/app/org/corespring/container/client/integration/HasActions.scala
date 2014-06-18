package org.corespring.container.client.integration

import org.corespring.container.client.actions._
import org.corespring.container.components.outcome.ScoreProcessor
import org.corespring.container.components.processing.PlayerItemPreProcessor
import org.corespring.container.components.response.OutcomeProcessor
import play.api.Configuration

trait HasHooks {
  def editorHooks: EditorHooks
  def catalogHooks: CatalogHooks
  def playerHooks: PlayerHooks
  def playerLauncherHooks: PlayerLauncherHooks
  def itemHooks: ItemHooks
  def sessionHooks: SessionHooks
}

trait HasConfig {
  def configuration: Configuration
}

trait HasProcessors {

  def outcomeProcessor: OutcomeProcessor
  def playerItemPreProcessor: PlayerItemPreProcessor
  def scoreProcessor: ScoreProcessor
}
