package org.corespring.container.client.controllers

import com.softwaremill.macwire.MacwireMacros.wire
import org.corespring.container.client.{V2PlayerConfig, VersionInfo}
import org.corespring.container.client.component.{ComponentBundler, ComponentJson}
import org.corespring.container.client.controllers.apps._
import org.corespring.container.client.controllers.helpers.{DefaultPlayerXhtml, PlayerXhtml}
import org.corespring.container.client.hooks._
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages._
import org.corespring.container.client.pages.engine.JadeEngine
import org.corespring.container.client.pages.processing.AssetPathProcessor
import org.corespring.container.components.processing.{PlayerItemPreProcessor, StashProcessor}
import org.corespring.container.components.services.ComponentService
import play.api.Mode.Mode
import play.api.mvc.Controller

case class EditorConfig(mode: Mode, showNonReleased: Boolean)

trait ControllersModule {
  def editorConfig: EditorConfig

  private lazy val mode: Mode = editorConfig.mode

  def assetPathProcessor: AssetPathProcessor
  def catalogHooks: CatalogHooks
  def componentBundler: ComponentBundler
  def componentJson: ComponentJson
  def componentService: ComponentService
  def containerContext: ContainerExecutionContext
  def dataQueryHooks: DataQueryHooks
  def draftEditorHooks: DraftEditorHooks
  def editorClientOptions: EditorClientOptions
  def itemEditorHooks: ItemEditorHooks
  def jadeEngine: JadeEngine
  def pageSourceService: PageSourceService
  def playerConfig: V2PlayerConfig
  def playerHooks: PlayerHooks
  def playerItemPreProcessor: PlayerItemPreProcessor
  def stashProcessor: StashProcessor
  def versionInfo: VersionInfo

  lazy val catalog: Catalog = wire[Catalog]
  lazy val catalogRenderer: CatalogRenderer = wire[CatalogRenderer]
  lazy val componentEditor: ComponentEditor = wire[ComponentEditor]
  lazy val componentEditorRenderer: ComponentEditorRenderer = wire[ComponentEditorRenderer]
  lazy val dataQuery: DataQuery = wire[DataQuery]
  lazy val devEditorRenderer: DevEditorRenderer = wire[DevEditorRenderer]
  lazy val draftDevEditor: DraftDevEditor = wire[DraftDevEditor]
  lazy val draftEditor: DraftEditor = wire[DraftEditor]
  lazy val itemDevEditor: ItemDevEditor = wire[ItemDevEditor]
  lazy val itemEditor: ItemEditor = wire[ItemEditor]
  lazy val mainEditorRenderer: MainEditorRenderer = wire[MainEditorRenderer]
  lazy val player: Player = wire[Player]
  lazy val playerRenderer: PlayerRenderer = wire[PlayerRenderer]
  lazy val playerXhtml: PlayerXhtml = wire[DefaultPlayerXhtml]
  lazy val rig: Rig = wire[Rig]
  lazy val rigRenderer: RigRenderer = wire[RigRenderer]

  lazy val containerMainControllers: Seq[Controller] = Seq(
    catalog,
    componentEditor,
    dataQuery,
    draftDevEditor,
    draftEditor,
    itemDevEditor,
    itemEditor,
    player,
    rig
  )

}
