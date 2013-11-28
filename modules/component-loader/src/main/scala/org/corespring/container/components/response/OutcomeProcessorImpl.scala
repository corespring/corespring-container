package org.corespring.container.components.response

import org.corespring.container.components.model.{Library, UiComponent}
import org.slf4j.LoggerFactory
import play.api.libs.json.{JsObject, JsValue}

class OutcomeProcessorImpl(components: Seq[UiComponent], libraries : Seq[Library]) extends OutcomeProcessor {

  private lazy val logger = LoggerFactory.getLogger("components.outcome")

  def createOutcome(item: JsValue, answers: JsValue, settings: JsValue): JsValue = {

    def getTargetIdFor(id:String) = {
      val componentQuestions = (item \ "components").as[JsObject]
      val question = (componentQuestions \ id).as[JsObject]
      val targetId = (question \ "target" \ "id").asOpt[String]
      targetId
    }

    def createOutcomeForComponent(id:String, targetOutcome:JsValue):(String, JsValue) = {
      val componentQuestions = (item \ "components").as[JsObject]
      val question = (componentQuestions \ id).as[JsObject]
      val componentType = (question \ "componentType").as[String]

      val answer = getAnswer(answers, id)
      println("answer " +answer)

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

    val responsesWithoutTarget: Seq[(String, JsValue)] = componentQuestions.keys.toSeq.filter(getTargetIdFor(_).isEmpty).map(createOutcomeForComponent(_, JsObject(Seq.empty)))
    val responsesWithTarget: Seq[(String, JsValue)] = componentQuestions.keys.toSeq.filter(!getTargetIdFor(_).isEmpty).map {
      id=>
        val targetId = getTargetIdFor(id).get
        val existingOutcome = responsesWithoutTarget.find(_._1 == targetId).map(_._2).getOrElse(JsObject(Seq.empty))
        createOutcomeForComponent(id, existingOutcome)
    }

    println("--")
    println(responsesWithoutTarget)
    println(responsesWithTarget)

    JsObject(responsesWithoutTarget ++ responsesWithTarget)
  }

  private def getAnswer(answers: JsValue, id: String): Option[JsValue] = for {
    componentSession <- (answers \ "components" \ id).asOpt[JsObject]
    answer <- (componentSession \ "answers").asOpt[JsValue]
  } yield answer
}
