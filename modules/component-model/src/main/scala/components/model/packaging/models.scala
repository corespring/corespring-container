package org.corespring.container.components.model.packaging

import play.api.libs.json.{Json, JsObject, JsValue}

case class ClientSideDependency(name: String, files: Seq[String])

object ClientSideDependency {

  def apply(name: String, json: JsValue): ClientSideDependency = {
    val files = (json \ "file").asOpt[String].toSeq
    ClientSideDependency(name, files)
  }
}

object ClientDependencies {

  def apply(json: JsValue): Seq[ClientSideDependency] = {
    val client = (json \ "client").asOpt[JsObject].getOrElse(Json.obj())
    client.fieldSet.toSeq.map(tuple => ClientSideDependency(tuple._1, tuple._2))
  }
}

