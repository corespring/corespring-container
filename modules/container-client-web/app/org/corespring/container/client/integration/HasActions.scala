package org.corespring.container.client.integration

import org.corespring.container.client.hooks._
import org.corespring.container.components.outcome.ScoreProcessor
import org.corespring.container.components.processing.PlayerItemPreProcessor
import org.corespring.container.components.response.OutcomeProcessor
import play.api.Configuration

trait HasHooks {
  def draftEditorHooks: EditorHooks
  def itemEditorHooks: EditorHooks
  def catalogHooks: CatalogHooks
  def playerHooks: PlayerHooks
  def playerLauncherHooks: PlayerLauncherHooks
  def collectionHooks: CollectionHooks
  def itemDraftHooks: CoreItemHooks with DraftHooks
  def itemDraftSupportingMaterialHooks : SupportingMaterialHooks
  def itemHooks: CoreItemHooks with CreateItemHook
  def itemSupportingMaterialHooks : SupportingMaterialHooks
  def sessionHooks: SessionHooks
  def dataQueryHooks: DataQueryHooks
}

trait HasConfig {
  def configuration: Configuration
}

trait HasProcessors {

  def outcomeProcessor: OutcomeProcessor
  def playerItemPreProcessor: PlayerItemPreProcessor
  def scoreProcessor: ScoreProcessor
}
