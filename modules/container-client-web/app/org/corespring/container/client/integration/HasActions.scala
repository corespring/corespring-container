package org.corespring.container.client.integration

import play.api.Configuration

//trait HasHooks {
//  def draftEditorHooks: DraftEditorHooks
//  def itemEditorHooks: ItemEditorHooks
//  def catalogHooks: CatalogHooks
//  def playerHooks: PlayerHooks
//  def playerLauncherHooks: PlayerLauncherHooks
//  def collectionHooks: CollectionHooks
//  def itemMetadataHooks: ItemMetadataHooks
//  def itemDraftHooks: CoreItemHooks with DraftHooks
//  def itemDraftSupportingMaterialHooks: ItemDraftSupportingMaterialHooks
//  def itemHooks: CoreItemHooks with CreateItemHook
//  def itemSupportingMaterialHooks: ItemSupportingMaterialHooks
//  def sessionHooks: SessionHooks
//  def dataQueryHooks: DataQueryHooks
//}

trait HasConfig {
  def configuration: Configuration
}

