package org.corespring.container.client.component

import org.corespring.container.components.model._
import play.api.libs.json.Json

trait ComponentMaker {

  private lazy val defaultOrg = "org"

  def uiComp(name: String, libs: Seq[LibraryId], title: Option[String] = None, titleGroup: Option[String] = None, org: String = defaultOrg) = {
    UiComponent(org, name, title, titleGroup, Client("", "", None), Server(""), Json.obj("name" -> name, "org" -> org), Json.obj(), None, Map(), libs)
  }

  def lib(name: String, libraries: Seq[LibraryId] = Seq.empty, org: String = defaultOrg): Library = {
    Library(org, name, Json.obj("name" -> name), Seq.empty, Seq.empty, None, libraries)
  }

  def libId(name: String, scope: Option[String] = None, org: String = defaultOrg) = LibraryId(org, name, scope)

  def layout(name: String, org: String = defaultOrg) = LayoutComponent(org, name, Seq.empty, None, Json.obj("name" -> name, "org" -> org))

  def id(name: String, org: String = defaultOrg) = new Id(org, name)
}
