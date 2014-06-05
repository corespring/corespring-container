package org.corespring.container.components.model

import play.api.libs.json.JsValue

class Component(val id: Id, val packageInfo: JsValue) {
  val SnakeCase = """(.*?)-(.*)""".r

  def matchesType(snakeCase: String): Boolean = {
    val SnakeCase(org, name) = snakeCase
    this.id.org == org && this.id.name == name
  }

  def componentType: String = s"${id.org}-${id.name}"
}

class Id(val org: String, val name: String) {
  def matches(other: Id) = org == other.org && name == other.name
}

case class LibraryId(override val org: String, override val name: String, scope: Option[String]) extends Id(org, name)

case class Library(
  org: String,
  name: String,
  override val packageInfo: JsValue,
  client: Seq[LibrarySource] = Seq.empty,
  server: Seq[LibrarySource] = Seq.empty,
  css: Option[String],
  libraries: Seq[LibraryId])
  extends Component(new Id(org, name), packageInfo)

case class LibrarySource(name: String, source: String)

/** A component implementation */
case class UiComponent(
  org: String,
  name: String,
  title: Option[String],
  titleGroup: Option[String],
  client: Client,
  server: Server,
  override val packageInfo: JsValue,
  defaultData: JsValue,
  icon: Option[Array[Byte]] = None,
  sampleData: Map[String, JsValue] = Map.empty,
  libraries: Seq[LibraryId] = Seq.empty) extends Component(new Id(org, name), packageInfo)

case class LayoutComponent(org: String,
  name: String,
  client: Seq[LibrarySource],
  css: Option[String],
  override val packageInfo: JsValue) extends Component(new Id(org, name), packageInfo)

case class Client(render: String, configure: String, css: Option[String])

case class Server(definition: String)

/** a model for a component implementation */
case class ComponentModel(
  componentType: String,
  correctResponse: JsValue,
  feedback: JsValue,
  model: JsValue)