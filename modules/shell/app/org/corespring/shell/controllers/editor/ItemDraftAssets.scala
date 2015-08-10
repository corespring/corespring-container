package org.corespring.shell.controllers.editor

import org.bson.types.ObjectId
import org.corespring.container.client.hooks.Binary
import org.corespring.shell.controllers.editor.actions.DraftId

import scalaz.Validation

trait ItemDraftAssets {
  def copyItemToDraft(itemId: String, draftName: String)
  def copyDraftToItem(draftId: String, itemId: String)
  def deleteDraft(draftId: String)
  def uploadSupportingMaterialBinary(draftId:DraftId[ObjectId], binary : Binary) : Validation[String,String]
}

trait ItemAssets {
  def deleteItem(id:String) : Unit
  def uploadSupportingMaterialBinary(id:String, binary : Binary) : Validation[String,String]
}
