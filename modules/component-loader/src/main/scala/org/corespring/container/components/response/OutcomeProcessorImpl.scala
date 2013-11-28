package org.corespring.container.components.response

import org.corespring.container.components.model.{Library, UiComponent}
import org.slf4j.LoggerFactory
import play.api.libs.json.{JsObject, JsValue}

class OutcomeProcessorImpl(components: Seq[UiComponent], libraries : Seq[Library]) extends OutcomeProcessor {

  private lazy val logger = LoggerFactory.getLogger("components.outcome")

  def createOutcome(item: JsValue, answers: JsValue, settings: JsValue): JsValue = {

    def createOutcomeForComponent(id:String):(String, JsValue) = {
      val componentQuestions = (item \ "components").as[JsObject]
      val question = (componentQuestions \ id).as[JsObject]
      val componentType = (question \ "componentType").as[String]
      val targetId = (question \ "target" \ "id").asOpt[String]

      val targetOutcome = targetId.map {
        tId =>
          createOutcomeForComponent(tId)._2
      }.getOrElse(JsObject(Seq.empty))

      val answer = getAnswer(answers, id)

      components.find(_.matchesType(componentType)).map {
        component =>

          answer.map {
            a =>
              val componentLibraries : Seq[Library] = component.libraries.map( id => libraries.find(l => l.id.matches(id) )).flatten
              val generator = new OutcomeGenerator(component.componentType, component.server.definition, componentLibraries)
              (id, generator.createOutcome(question, a, settings, targetOutcome))
          }.getOrElse {
            logger.debug(s"no answer provided for: $id")
            (id, JsObject(Seq.empty))
          }
      }.getOrElse((id, JsObject(Seq.empty)))

    }

    val componentQuestions = (item \ "components").as[JsObject]

    val responses: Seq[(String, JsValue)] = componentQuestions.keys.toSeq.map(createOutcomeForComponent(_))

    JsObject(responses)
  }

  private def getAnswer(answers: JsValue, id: String): Option[JsValue] = for {
    componentSession <- (answers \ "components" \ id).asOpt[JsObject]
    answer <- (componentSession \ "answers").asOpt[JsValue]
  } yield answer
}
