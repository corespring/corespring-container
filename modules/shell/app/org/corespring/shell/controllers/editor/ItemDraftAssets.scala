package org.corespring.shell.controllers.editor

trait ItemDraftAssets {
  def copyItemToDraft(itemId: String, draftName: String)
  def copyDraftToItem(draftId: String, itemId: String)
  def deleteDraft(draftId: String)
}

trait ItemAssets {
  def deleteItem(id:String) : Unit
}
