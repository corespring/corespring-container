package org.corespring.container.components.response

import org.corespring.container.components.model.{Library, UiComponent}
import org.slf4j.LoggerFactory
import play.api.libs.json.{JsObject, JsValue}

class ResponseProcessorImpl(components: Seq[UiComponent], libraries : Seq[Library]) extends ResponseProcessor {

  private lazy val logger = LoggerFactory.getLogger("components.response")

  def respond(item: JsValue, session: JsValue): JsValue = {

    val componentQuestions = (item \ "components").as[JsObject]

    val responses: Seq[(String, JsValue)] = componentQuestions.keys.toSeq.map {
      id =>

        val question = (componentQuestions \ id).as[JsObject]
        val componentType = (question \ "componentType").as[String]

        val answer = getAnswer(session, id)

        components.find(_.matchesType(componentType)).map {
          component =>

            answer.map {
              a =>
                val componentLibraries : Seq[Library] = component.libraries.map( id => libraries.find(l => l.id == id )).flatten
                val generator = new ResponseGenerator(component.componentType, component.server.definition, componentLibraries)
                (id, generator.respond(question, a, session \ "settings"))
            }.getOrElse {
              logger.debug(s"no answer provided for: $id")
              (id, JsObject(Seq.empty))
            }
        }.getOrElse((id, JsObject(Seq.empty)))
    }
    JsObject(responses)
  }

  private def getAnswer(session: JsValue, id: String): Option[JsValue] = for {
    componentSession <- (session \ "components" \ id).asOpt[JsObject]
    answer <- (componentSession \ "answers").asOpt[JsValue]
  } yield answer

}
