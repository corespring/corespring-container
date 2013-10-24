package org.corespring.container.components.model

import play.api.libs.json.JsValue


/** A component implementation */
case class Component(
  org : String,
  name : String,
  client: Client,
  server : Server,
  packageInfo : JsValue,
  defaultData : JsValue,
  icon : Option[Array[Byte]] = None,
  sampleData : Map[String,JsValue] = Map.empty
){
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