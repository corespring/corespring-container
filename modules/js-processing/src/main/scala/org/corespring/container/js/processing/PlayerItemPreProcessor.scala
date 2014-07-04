package org.corespring.container.js.processing

import org.corespring.container.components.model.{ Interaction, Library }
import org.corespring.container.components.processing.{ PlayerItemPreProcessor => PreProcessor }
import org.corespring.container.js.api.GetServerLogic
import play.api.libs.json._

trait PlayerItemPreProcessor extends PreProcessor with GetServerLogic {

  def interactions: Seq[Interaction]
  def libraries: Seq[Library]

  def preProcessItemForPlayer(item: JsValue, settings: JsValue): JsValue = {

    def processComponent(id: String): (String, JsValue) = {
      val componentQuestions = (item \ "components").as[JsObject]
      val question = (componentQuestions \ id).as[JsObject]
      val componentType = (question \ "componentType").as[String]

      interactions.find(_.matchesType(componentType)).map {
        i =>

          def hasRenderFunction: Boolean = {
            val renderFunctionRegexp = "(?s)exports(\\.|\\[\")render[^;]*?=[^;]*function".r
            renderFunctionRegexp.findFirstIn(i.server.definition).isDefined
          }

          if (!hasRenderFunction) {
            (id, question)
          } else {
            val componentLibraries: Seq[Library] = i.libraries.map(id => libraries.find(l => l.id.orgNameMatch(id))).flatten
            val serverComponent = serverLogic(i.componentType, i.server.definition, componentLibraries)
            (id, serverComponent.preProcessItem(question, settings))
          }
      }.getOrElse((id, JsObject(Seq.empty)))
    }

    val componentQuestions = (item \ "components").as[JsObject]

    val processedItem: Seq[(String, JsValue)] = componentQuestions.keys.toSeq.map(processComponent(_))
    val processedJson = JsObject(processedItem)

    val jsonTransformer = (__ \ 'components).json.update(
      __.read[JsObject].map {
        o => processedJson
      })

    item.transform(jsonTransformer) match {
      case succ: JsSuccess[JsObject] => succ.get
      case _ => item
    }

  }

}
