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

case class Id(org: String, name: String, scope: Option[String] = None) {
  def orgNameMatch(other: Id): Boolean = org == other.org && name == other.name
}

case class Library(
  org: String,
  name: String,
  override val packageInfo: JsValue,
  client: Seq[LibrarySource] = Seq.empty,
  server: Seq[LibrarySource] = Seq.empty,
  css: Option[String],
  libraries: Seq[Id])
  extends Component(Id(org, name), packageInfo)

case class LibrarySource(name: String, source: String)

trait ComponentInfo {
  def id: Id
  def title: Option[String]
  def titleGroup: Option[String]
  def icon: Option[Array[Byte]]
  def componentType: String
  def defaultData: JsValue
  def packageInfo: JsValue
  def sampleData: Map[String, JsValue]
  def released: Boolean
}

case class Widget(org: String,
  name: String,
  title: Option[String],
  titleGroup: Option[String],
  client: Client,
  released: Boolean,
  override val packageInfo: JsValue,
  defaultData: JsValue,
  icon: Option[Array[Byte]] = None,
  sampleData: Map[String, JsValue] = Map.empty,
  libraries: Seq[Id] = Seq.empty) extends Component(Id(org, name), packageInfo) with ComponentInfo

/**
 * An interaction is a component that the user can interact with.
 *
 */
case class Interaction(
  org: String,
  name: String,
  released: Boolean,
  title: Option[String],
  titleGroup: Option[String],
  client: Client,
  server: Server,
  override val packageInfo: JsValue,
  defaultData: JsValue,
  icon: Option[Array[Byte]] = None,
  sampleData: Map[String, JsValue] = Map.empty,
  libraries: Seq[Id] = Seq.empty) extends Component(Id(org, name), packageInfo) with ComponentInfo

case class LayoutComponent(org: String,
  name: String,
  client: Seq[LibrarySource],
  css: Option[String],
  released: Boolean,
  override val packageInfo: JsValue) extends Component(Id(org, name), packageInfo)

case class Client(render: String,
  configure: String,
  css: Option[String],
  renderLibs: Seq[LibrarySource] = Seq.empty,
  configureLibs: Seq[LibrarySource] = Seq.empty)

case class Server(definition: String)

/** a model for a component implementation */
case class ComponentModel(
  componentType: String,
  correctResponse: JsValue,
  feedback: JsValue,
  model: JsValue)