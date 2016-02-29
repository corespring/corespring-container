package org.corespring.container.client.controllers

import com.softwaremill.macwire.MacwireMacros.wire
import org.corespring.container.client.{ V2PlayerConfig, VersionInfo }
import org.corespring.container.client.component.{ ComponentBundler, ComponentJson, ComponentService }
import org.corespring.container.client.controllers.apps._
import org.corespring.container.client.controllers.helpers.{ DefaultPlayerXhtml, PlayerXhtml }
import org.corespring.container.client.hooks._
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages._
import org.corespring.container.client.pages.engine.JadeEngine
import org.corespring.container.client.pages.processing.AssetPathProcessor
import org.corespring.container.components.processing.PlayerItemPreProcessor
import play.api.Mode.Mode
import play.api.mvc.Controller

trait ControllersModule {
  def mode: Mode
  def playerConfig: V2PlayerConfig
  def itemEditorHooks: ItemEditorHooks
  def draftEditorHooks: DraftEditorHooks
  def catalogHooks: CatalogHooks
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
  def dataQueryHooks: DataQueryHooks

  lazy val dataQuery: DataQuery = wire[DataQuery]
  lazy val playerXhtml: PlayerXhtml = wire[DefaultPlayerXhtml]
  lazy val mainEditorRenderer: MainEditorRenderer = wire[MainEditorRenderer]
  lazy val devEditorRenderer: DevEditorRenderer = wire[DevEditorRenderer]
  lazy val catalogRenderer: CatalogRenderer = wire[CatalogRenderer]
  lazy val componentEditorRenderer: ComponentEditorRenderer = wire[ComponentEditorRenderer]
  lazy val rigRenderer: RigRenderer = wire[RigRenderer]
  lazy val playerRenderer: PlayerRenderer = wire[PlayerRenderer]
  lazy val itemEditor: ItemEditor = wire[ItemEditor]
  lazy val itemDevEditor: ItemDevEditor = wire[ItemDevEditor]
  lazy val draftEditor: DraftEditor = wire[DraftEditor]
  lazy val draftDevEditor: DraftDevEditor = wire[DraftDevEditor]
  lazy val componentEditor: ComponentEditor = wire[ComponentEditor]
  lazy val player: Player = wire[Player]
  lazy val rig: Rig = wire[Rig]
  lazy val catalog: Catalog = wire[Catalog]
  lazy val containerMainControllers: Seq[Controller] = Seq(
    rig,
    catalog,
    player,
    itemEditor,
    itemDevEditor,
    draftEditor,
    draftDevEditor,
    componentEditor,
    dataQuery)

}
