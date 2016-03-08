package org.corespring.container.js.processing

import org.corespring.container.components.processing.{PlayerItemPreProcessor => PreProcessor, ItemPruner}
import org.corespring.container.js.api.GetServerLogic
import play.api.libs.json._

trait PlayerItemPreProcessor extends PreProcessor with GetServerLogic with ItemPruner{

  def preProcessItemForPlayer(item: JsValue): JsValue = {

    def processComponent(id: String): (String, JsValue) = {
      val componentQuestions = (item \ "components").as[JsObject]
      val question = (componentQuestions \ id).as[JsObject]
      val componentType = (question \ "componentType").as[String]
      val serverComponent = serverLogic(componentType)
      (id, serverComponent.preProcessItem(question))
    }

    val componentQuestions = (item \ "components").as[JsObject]

    val processedItem: Seq[(String, JsValue)] = componentQuestions.keys.toSeq.map(processComponent(_))
    val processedJson = JsObject(processedItem)

    val jsonTransformer = (__ \ 'components).json.update(
      __.read[JsObject].map {
        o => processedJson
      })

    item.transform(jsonTransformer) match {
      case succ: JsSuccess[JsObject] => pruneItem(succ.get)
      case _ => item
    }

  }

}
