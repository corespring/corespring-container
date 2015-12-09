package org.corespring.container.components.model.packaging

import play.api.libs.json.{ Json, JsObject, JsValue }

case class ClientSideDependency(name: String, files: Seq[String], angularModule: Option[String]) {

  /* todo ben
  def jsFiles = files.filter(_.endsWith(".js"))
  def cssFiles = files.filter(_.endsWith(".css"))
  */

}

object ClientSideDependency {

  def apply(name: String, json: JsValue): ClientSideDependency = {
    /* todo ben
    val files = Seq("files", "file", "src", "js", "css").map(key =>
      (json \ key).asOpt[String] ++ (json \ key).asOpt[Seq[String]].getOrElse(Seq.empty)
    ).flatten
    */
    val files = (json \ "file").asOpt[String].toSeq
    val ngModule = (json \ "angular-module").asOpt[String]
    ClientSideDependency(name, files, ngModule)
  }
}

object ClientDependencies {

  def apply(json: JsValue): Seq[ClientSideDependency] = {
    val client = (json \ "client").asOpt[JsObject].getOrElse(Json.obj())
    client.fieldSet.toSeq.map(tuple => ClientSideDependency(tuple._1, tuple._2))
  }
}

