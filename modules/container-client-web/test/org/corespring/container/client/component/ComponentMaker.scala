package org.corespring.container.client.component

import org.corespring.container.components.model._
import play.api.libs.json.Json

trait ComponentMaker {

  def uiComp(org: String, name: String, libs: Seq[LibraryId]) = {
    UiComponent(org, name, Client("", "", None), Server(""), Json.obj("name" -> name, "org" -> org), Json.obj(), None, Map(), libs)
  }

  def lib(org: String, name: String): Library = {
    Library(org, name, Json.obj("name" -> name), Seq.empty, Seq.empty, None)
  }

  def libId(org: String, name: String, scope: Option[String] = None) = LibraryId(org, name, scope)

  def layout(org: String, name: String) = LayoutComponent(org, name, Seq.empty, None, Json.obj("name" -> name, "org" -> org))

  def id(org: String, name: String) = new Id(org, name)
}
