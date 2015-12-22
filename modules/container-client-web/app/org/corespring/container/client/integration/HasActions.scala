package org.corespring.container.client.integration

import org.corespring.container.client.hooks._
import org.corespring.container.components.outcome.ScoreProcessor
import org.corespring.container.components.processing.PlayerItemPreProcessor
import org.corespring.container.components.response.OutcomeProcessor
import play.api.Configuration

trait HasHooks {
  def draftEditorHooks: DraftEditorHooks
  def itemEditorHooks: ItemEditorHooks
  def catalogHooks: CatalogHooks
  def playerHooks: PlayerHooks
  def playerLauncherHooks: PlayerLauncherHooks
  def collectionHooks: CollectionHooks
  def itemMetadataHooks: ItemMetadataHooks
  def itemDraftHooks: CoreItemHooks with DraftHooks
  def itemDraftSupportingMaterialHooks: ItemDraftSupportingMaterialHooks
  def itemHooks: CoreItemHooks with CreateItemHook
  def itemSupportingMaterialHooks: ItemSupportingMaterialHooks
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
