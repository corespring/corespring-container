package org.corespring.container.components.model.dependencies

import org.corespring.container.components.model._
import play.api.libs.json.Json

trait ComponentMaker {

  private lazy val defaultOrg = "org"

  def uiComp(name: String, libs: Seq[Id], title: Option[String] = None, titleGroup: Option[String] = None,
             org: String = defaultOrg, released: Boolean = false, insertInline: Boolean = false) = {
    Interaction(
      org = org,
      name = name,
      title = title,
      titleGroup = titleGroup,
      released = released,
      insertInline = insertInline,
      client = Client("", "", None),
      server = Server(""),
      packageInfo = Json.obj("name" -> name, "org" -> org),
      defaultData = Json.obj(),
      icon = None,
      sampleData = Map(),
      libraries = libs)
  }

  def widget(name: String, libs: Seq[Id] = Seq.empty, title: Option[String] = None, titleGroup: Option[String] = None, org: String = defaultOrg) = {
    Widget(org, name, title, titleGroup, Client("", "", None), true, false, Json.obj("name" -> name, "org" -> org),
      Json.obj(), None, Map(), libs)
  }

  def lib(name: String, libraries: Seq[Id] = Seq.empty, org: String = defaultOrg): Library = {
    Library(org, name, Json.obj("name" -> name), Seq.empty, Seq.empty, None, libraries)
  }

  def id(name: String, scope: Option[String] = None, org: String = defaultOrg) = Id(org, name, scope)

  def layout(name: String, org: String = defaultOrg) = LayoutComponent(org, name, Seq.empty, None, true, false, Json.obj("name" -> name, "org" -> org))

}
