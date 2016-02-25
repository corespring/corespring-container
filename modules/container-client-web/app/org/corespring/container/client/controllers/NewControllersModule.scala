package org.corespring.container.client.controllers

import com.softwaremill.macwire.MacwireMacros.wire
import org.corespring.container.client.VersionInfo
import org.corespring.container.client.component.{ComponentBundler, ComponentJson}
import org.corespring.container.client.controllers.apps._
import org.corespring.container.client.controllers.helpers.{DefaultPlayerXhtml, PlayerXhtml}
import org.corespring.container.client.hooks.{CatalogHooks, DraftEditorHooks, ItemEditorHooks, PlayerHooks}
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages._
import org.corespring.container.client.pages.engine.JadeEngine
import org.corespring.container.client.pages.processing.AssetPathProcessor
import org.corespring.container.components.processing.PlayerItemPreProcessor
import play.api.Mode.Mode
import play.api.mvc.Controller

trait NewControllersModule {
  def mode: Mode
  def itemEditorHooks: ItemEditorHooks
  def draftEditorHooks: DraftEditorHooks
  def catalogHooks : CatalogHooks
  def playerHooks: PlayerHooks
  def componentBundler: ComponentBundler
  def containerContext: ContainerExecutionContext
  def componentJson: ComponentJson
  def componentService: ComponentService
  def jadeEngine: JadeEngine
  def pageSourceService: PageSourceService
  def assetPathProcessor: AssetPathProcessor
  def versionInfo: VersionInfo
  def playerItemPreProcessor: PlayerItemPreProcessor

  lazy val playerXhtml: PlayerXhtml = wire[DefaultPlayerXhtml]
  lazy val mainEditorRenderer: MainEditorRenderer = wire[MainEditorRenderer]
  lazy val devEditorRenderer: DevEditorRenderer = wire[DevEditorRenderer]
  lazy val catalogRenderer : CatalogRenderer = wire[CatalogRenderer]
  lazy val componentEditorRenderer: ComponentEditorRenderer = wire[ComponentEditorRenderer]
  lazy val rigRenderer: RigRenderer = wire[RigRenderer]
  lazy val playerRenderer: PlayerRenderer = wire[PlayerRenderer]
  lazy val itemEditor: NewItemEditor = wire[NewItemEditor]
  lazy val itemDevEditor: NewItemDevEditor = wire[NewItemDevEditor]
  lazy val draftEditor: NewDraftEditor = wire[NewDraftEditor]
  lazy val draftDevEditor: NewDraftDevEditor = wire[NewDraftDevEditor]
  lazy val componentEditor: ComponentEditor = wire[ComponentEditor]
  lazy val player: NewPlayer = wire[NewPlayer]
  lazy val rig: NewRig = wire[NewRig]
  lazy val catalog : NewCatalog = wire[NewCatalog]
  lazy val newEditorControllers: Seq[Controller] = Seq(
    rig,
    catalog,
    player,
    itemEditor,
    itemDevEditor,
    draftEditor,
    draftDevEditor)

}
