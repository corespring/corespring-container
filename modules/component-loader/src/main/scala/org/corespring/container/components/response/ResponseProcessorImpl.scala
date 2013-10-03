package org.corespring.container.components.response

import org.corespring.container.components.model.Component
import play.api.libs.json.{JsObject, JsValue}

class ResponseProcessorImpl(components:Seq[Component]) extends ResponseProcessor{

  def respond(item: JsValue, session: JsValue): JsValue = {

    val componentQuestions = (item \ "components").as[JsObject]

    val responses = componentQuestions.keys.map{ id =>

      val question = (componentQuestions \ id).as[JsObject]
      val componentType = (question \ "componentType").as[String]

      val answer = (session \ "answers" \ id).asOpt[JsObject]

      components.find( _.matchesType(componentType)).map{ component =>
        val generator = new ResponseGenerator(component.server.definition, question, answer.get, answer.get)
        generator.response
      }.getOrElse(JsObject(Seq.empty))
    }
    JsObject(Seq.empty)
  }
}
