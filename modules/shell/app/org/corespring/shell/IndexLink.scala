package org.corespring.shell

case class DraftLink(name:String, edit:String,componentEdit:String,delete:String)

case class SessionLink(id:String, gather:String, view:String, delete:String)

case class IndexLink(title: String,
                      createSession: String,
                      sessionLinks : Seq[SessionLink],
                      draftEdit: String,
                      itemEdit: String,
                      itemComponentEdit: String,
                      draftComponentEdit: String,
                      drafts:Seq[DraftLink],
                      delete: String,
                      catalog: String)
