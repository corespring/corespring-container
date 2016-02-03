package org.corespring.shell

case class DraftLink(name:String, edit:String,componentEdit:String,delete:String)
case class IndexLink(title: String,
                      createSession: String,
                      draftEdit: String,
                      itemEdit: String,
                      itemComponentEdit: String,
                      draftComponentEdit: String,
                      drafts:Seq[DraftLink],
                      delete: String,
                      catalog: String)
