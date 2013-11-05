package org.corespring.container.components.model

import play.api.libs.json.JsValue

class Component(id: Id, packageInfo: JsValue)

case class Id(org: String, name: String)

case class Library(org: String, name: String, packageInfo: JsValue, client: Seq[LibrarySource] = Seq.empty, server: Seq[LibrarySource] = Seq.empty)
  extends Component(Id(org, name), packageInfo)

case class LibrarySource(name: String, source: String)

/** A component implementation */
case class UiComponent(
  org : String,
  name : String,
  client: Client,
  server : Server,
  packageInfo : JsValue,
  defaultData : JsValue,
  icon : Option[Array[Byte]] = None,
  sampleData: Map[String, JsValue] = Map.empty,
  libraries : Seq[Id] = Seq.empty) extends Component(Id(org, name), packageInfo) {
  val SnakeCase = """(.*?)-(.*)""".r

  def matchesType(snakeCase:String) : Boolean = {
    val SnakeCase(org,name) = snakeCase
    this.org == org && this.name == name
  }

  def componentType : String = s"$org-$name"
}

case class Client( render : String, configure : String, css : Option[String] )

case class Server( definition : String)


/** a model for a component implementation */
case class ComponentModel(
  componentType : String,
  correctResponse : JsValue,
  feedback : JsValue,
  model : JsValue)