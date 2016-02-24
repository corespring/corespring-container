package org.corespring.container.client.controllers

import com.softwaremill.macwire.MacwireMacros.wire
import org.corespring.container.client.VersionInfo
import org.corespring.container.client.component.{ComponentBundler, ComponentJson}
import org.corespring.container.client.controllers.apps._
import org.corespring.container.client.hooks.{DraftEditorHooks, ItemEditorHooks}
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages.ComponentEditorRenderer
import org.corespring.container.client.pages.engine.{DevEditorRenderer, JadeEngine, MainEditorRenderer}
import org.corespring.container.client.pages.processing.AssetPathProcessor
import play.api.Mode.Mode
import play.api.mvc.Controller

trait NewControllersModule {
  def mode : Mode
  def itemEditorHooks : ItemEditorHooks
  def draftEditorHooks: DraftEditorHooks
  def componentBundler : ComponentBundler
  def containerContext:ContainerExecutionContext
  def componentJson : ComponentJson
  def componentService : ComponentService
  def jadeEngine: JadeEngine
  def pageSourceService: PageSourceService
  def assetPathProcessor:AssetPathProcessor
  def versionInfo : VersionInfo
  lazy val mainEditorRenderer : MainEditorRenderer = wire[MainEditorRenderer]
  lazy val devEditorRenderer : DevEditorRenderer = wire[DevEditorRenderer]
  lazy val componentEditorRenderer : ComponentEditorRenderer = wire[ComponentEditorRenderer]
  lazy val itemEditor : NewItemEditor = wire[NewItemEditor]
  lazy val itemDevEditor : NewItemDevEditor = wire[NewItemDevEditor]
  lazy val draftEditor : NewDraftEditor = wire[NewDraftEditor]
  lazy val draftDevEditor : NewDraftDevEditor = wire[NewDraftDevEditor]
  lazy val componentEditor : ComponentEditor = wire[ComponentEditor]
  lazy val newEditorControllers : Seq[Controller] = Seq(itemEditor, itemDevEditor, draftEditor, draftDevEditor)

}
