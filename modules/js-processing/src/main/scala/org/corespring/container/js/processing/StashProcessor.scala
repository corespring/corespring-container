package org.corespring.container.js.processing

import org.corespring.container.components.processing.{ ItemPruner, StashProcessor => AbstractStashProcessor }
import org.corespring.container.js.api.GetServerLogic
import play.api.libs.json._

trait StashProcessor extends AbstractStashProcessor with GetServerLogic with ItemPruner {

  def prepareStash(item: JsValue, session: JsValue): Option[JsValue] = {

    def processComponent(id: String): (String, Option[JsValue]) = {
      val componentQuestions = (item \ "components").as[JsObject]
      val question = (componentQuestions \ id).as[JsObject]
      val componentType = (question \ "componentType").as[String]
      val componentSession = (session \ "components" \ id).asOpt[JsValue].getOrElse(Json.obj())
      val serverComponent = serverLogic(componentType)
      (id, serverComponent.prepareStash(question, componentSession))
    }

    val componentQuestions = (item \ "components").as[JsObject]

    val processedItem = componentQuestions.keys.toSeq
      .map(processComponent(_))
      .filter(_._2.isDefined)
      .map((s:(String, Option[JsValue])) => (s._1, Json.obj("stash" -> s._2.get)))

    if(processedItem.length > 0){
      Some(JsObject(processedItem))
    } else {
      None
    }
  }

}
