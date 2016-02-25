package org.corespring.container.client.controllers.apps

import org.corespring.container.client.controllers.resources
import org.corespring.container.client.controllers.resources.routes._
import org.corespring.container.client.views.models.{ MainEndpoints, SupportingMaterialsEndpoints }
import org.corespring.container.client.views.txt.js.{ ComponentEditorServices, EditorServices }
import play.api.libs.json.{ JsArray, JsValue }
import play.api.mvc.Call
import resources.{ routes => resourceRoutes }

trait Endpoints {
  def main(id: String): MainEndpoints
  def supportingMaterials(id: String): SupportingMaterialsEndpoints
}

case class SessionEndpoints(
  loadItemAndSession: Call,
  reopen: Call,
  reset: Call,
  save: Call,
  getScore: Call,
  complete: Call,
  loadOutcome: Call,
  loadInstructorData: Call)

object PlayerEndpoints {

  def session(sessionId: String) = SessionEndpoints(
    Session.loadItemAndSession(sessionId),
    Session.reopenSession(sessionId),
    Session.resetSession(sessionId),
    Session.saveSession(sessionId),
    Session.getScore(sessionId),
    Session.completeSession(sessionId),
    Session.loadOutcome(sessionId),
    Session.loadInstructorData(sessionId))
}

object ItemEditorEndpoints extends Endpoints {

  def supportingMaterials(itemId: String) = SupportingMaterialsEndpoints(
    create = resourceRoutes.Item.createSupportingMaterial(itemId),
    createFromFile = resourceRoutes.Item.createSupportingMaterialFromFile(itemId),
    delete = resourceRoutes.Item.deleteSupportingMaterial(itemId, ":name"),
    addAsset = resourceRoutes.Item.addAssetToSupportingMaterial(itemId, ":name"),
    deleteAsset = resourceRoutes.Item.deleteAssetFromSupportingMaterial(itemId, ":name", ":filename"),
    getAsset = resourceRoutes.Item.getAssetFromSupportingMaterial(itemId, ":name", ":filename"),
    updateContent = resourceRoutes.Item.updateSupportingMaterialContent(itemId, ":name", ":filename"))

  def main(itemId: String) = MainEndpoints(
    load = resourceRoutes.Item.load(itemId),
    saveSubset = resourceRoutes.Item.saveSubset(itemId, ":subset"),
    save = None)
}

object DraftEditorEndpoints extends Endpoints {

  def supportingMaterials(id: String) = SupportingMaterialsEndpoints(
    create = resourceRoutes.ItemDraft.createSupportingMaterial(id),
    createFromFile = resourceRoutes.ItemDraft.createSupportingMaterialFromFile(id),
    delete = resourceRoutes.ItemDraft.deleteSupportingMaterial(id, ":name"),
    addAsset = resourceRoutes.ItemDraft.addAssetToSupportingMaterial(id, ":name"),
    deleteAsset = resourceRoutes.ItemDraft.deleteAssetFromSupportingMaterial(id, ":name", ":filename"),
    getAsset = resourceRoutes.ItemDraft.getAssetFromSupportingMaterial(id, ":name", ":filename"),
    updateContent = resourceRoutes.ItemDraft.updateSupportingMaterialContent(id, ":name", ":filename"))

  def main(id: String) = MainEndpoints(
    load = resourceRoutes.ItemDraft.load(id),
    saveSubset = resourceRoutes.ItemDraft.saveSubset(id, ":subset"),
    save = Some(resourceRoutes.ItemDraft.save(id)))
}

trait BaseItemEditor extends CoreEditor {

  import resources.{ routes => resourceRoutes }

  override def servicesJs(itemId: String, components: JsArray, widgets: JsArray) = {

    val smEndpoints = SupportingMaterialsEndpoints(
      create = resourceRoutes.Item.createSupportingMaterial(itemId),
      createFromFile = resourceRoutes.Item.createSupportingMaterialFromFile(itemId),
      delete = resourceRoutes.Item.deleteSupportingMaterial(itemId, ":name"),
      addAsset = resourceRoutes.Item.addAssetToSupportingMaterial(itemId, ":name"),
      deleteAsset = resourceRoutes.Item.deleteAssetFromSupportingMaterial(itemId, ":name", ":filename"),
      getAsset = resourceRoutes.Item.getAssetFromSupportingMaterial(itemId, ":name", ":filename"),
      updateContent = resourceRoutes.Item.updateSupportingMaterialContent(itemId, ":name", ":filename"))
    "??"
    //    EditorServices(
    //      s"$context.services",
    //      resourceRoutes.Item.load(itemId),
    //      resourceRoutes.Item.saveSubset(itemId, ":subset"),
    //      None,
    //      smEndpoints,
    //      components,
    //      widgets).toString
  }
}

trait ItemDevEditor extends BaseItemEditor {
  override def context: String = "dev-editor"
}

trait ItemEditor extends BaseItemEditor {
  override def context: String = "editor"
}
