package org.corespring.shell

case class DraftLink(name:String, edit:String,delete:String)
case class IndexLink(title: String,
                      createSession: String,
                      edit: String,
                      devEdit:String,
                      drafts:Seq[DraftLink],
                      delete: String,
                      catalog: String)
