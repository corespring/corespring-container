package org.corespring.container.components.model.dependencies

import org.corespring.container.components.model._
import play.api.libs.json.Json
import org.corespring.container.components.model.LayoutComponent
import org.corespring.container.components.model.LibraryId
import org.corespring.container.components.model.Server
import org.corespring.container.components.model.Library
import org.corespring.container.components.model.Client
import org.corespring.container.components.model.UiComponent

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
