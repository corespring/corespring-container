package org.corespring.container.components.response

import org.corespring.container.components.model.Component
import org.slf4j.LoggerFactory
import play.api.libs.json.{JsObject, JsValue}

class ResponseProcessorImpl(components:Seq[Component]) extends ResponseProcessor{

  private lazy val logger = LoggerFactory.getLogger("components.response")

  def respond(item: JsValue, session: JsValue): JsValue = {

    val componentQuestions = (item \ "components").as[JsObject]

    val responses : Seq[(String,JsValue)] = componentQuestions.keys.toSeq.map{ id =>

      val question = (componentQuestions \ id).as[JsObject]
      val componentType = (question \ "componentType").as[String]

      val answer = (session \ "answers" \ id).asOpt[JsObject]

      components.find( _.matchesType(componentType)).map{ component =>

        answer.map{ a =>
          val generator = new ResponseGenerator(component.server.definition, question, a, session)
          (id, generator.response)
        }.getOrElse{
          logger.debug(s"no answer provided for: $id")
          (id, JsObject(Seq.empty))
        }
      }.getOrElse((id, JsObject(Seq.empty)))
    }
    JsObject(responses)
  }
}
