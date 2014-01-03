package org.corespring.container.components.processing

import org.corespring.container.components.model.{Library, UiComponent}
import org.slf4j.LoggerFactory
import components.processing.ItemProcessor
import play.api.libs.json._


class ItemProcessorImpl(components: Seq[UiComponent], libraries: Seq[Library]) extends ItemProcessor {

  private lazy val logger = LoggerFactory.getLogger("components.processing")

  def processItem(item: JsValue, settings: JsValue): JsValue = {

    def processComponent(id: String): (String, JsValue) = {
      val componentQuestions = (item \ "components").as[JsObject]
      val question = (componentQuestions \ id).as[JsObject]
      val componentType = (question \ "componentType").as[String]

      components.find(_.matchesType(componentType)).map {
        component =>

            val componentLibraries: Seq[Library] = component.libraries.map(id => libraries.find(l => l.id.matches(id))).flatten
            val processorServerLogic = new ItemProcessorServerLogic(component.componentType, component.server.definition, componentLibraries)
            (id, processorServerLogic.preProcessItem(question, settings))
      }.getOrElse((id, JsObject(Seq.empty)))

    }

    val componentQuestions = (item \ "components").as[JsObject]

    val processedItem: Seq[(String, JsValue)] = componentQuestions.keys.toSeq.map(processComponent(_))
    val processedJson = JsObject(processedItem)

    val jsonTransformer = (__ \ 'components).json.update(
      __.read[JsObject].map{ o => processedJson }
    )

    item.transform(jsonTransformer) match {
      case succ:JsSuccess[JsObject] => succ.get
      case _ => item
    }


  }

}
