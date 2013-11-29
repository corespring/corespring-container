package org.corespring.container.components.response

import org.corespring.container.components.model.{Library, UiComponent}
import org.slf4j.LoggerFactory
import play.api.libs.json.{JsObject, JsValue}

class OutcomeProcessorImpl(components: Seq[UiComponent], libraries: Seq[Library]) extends OutcomeProcessor {

  private lazy val logger = LoggerFactory.getLogger("components.outcome")

  def createOutcome(item: JsValue, answers: JsValue, settings: JsValue): JsValue = {

    def getTargetIdFor(id: String) = {
      val componentQuestions = (item \ "components").as[JsObject]
      val question = (componentQuestions \ id).as[JsObject]
      val targetId = (question \ "target" \ "id").asOpt[String]
      targetId
    }

    def createOutcomeForComponent(id: String, targetOutcome: JsValue): (String, JsValue) = {
      val componentQuestions = (item \ "components").as[JsObject]
      val question = (componentQuestions \ id).as[JsObject]
      val componentType = (question \ "componentType").as[String]

      val answer = getAnswer(answers, id)

      components.find(_.matchesType(componentType)).map {
        component =>

          answer.map {
            a =>
              val componentLibraries: Seq[Library] = component.libraries.map(id => libraries.find(l => l.id.matches(id))).flatten
              val generator = new OutcomeGenerator(component.componentType, component.server.definition, componentLibraries)

              (id, generator.createOutcome(question, a, settings, targetOutcome))
          }.getOrElse {
            logger.debug(s"no answer provided for: $id")
            (id, JsObject(Seq.empty))
          }
      }.getOrElse((id, JsObject(Seq.empty)))

    }

    val componentQuestions = (item \ "components").as[JsObject]

    val componentsGroupedByTargetExist = componentQuestions.keys.toSeq.groupBy {
      g =>
        Map(true -> "withoutTarget", false -> "withTarget").get(getTargetIdFor(g).isEmpty).getOrElse("")
    }

    val outcomesWithoutTarget: Seq[(String, JsValue)] = componentsGroupedByTargetExist.get("withoutTarget").getOrElse(Seq()).map(createOutcomeForComponent(_, JsObject(Seq.empty)))
    val outcomesWithTarget: Seq[(String, JsValue)] = componentsGroupedByTargetExist.get("withTarget").getOrElse(Seq()).map {
      id =>
        val targetId = getTargetIdFor(id).get
        val existingOutcome = outcomesWithoutTarget.find(_._1 == targetId).map(_._2).getOrElse(JsObject(Seq.empty))
        createOutcomeForComponent(id, existingOutcome)
    }

    JsObject(outcomesWithoutTarget ++ outcomesWithTarget)
  }

  private def getAnswer(answers: JsValue, id: String): Option[JsValue] = for {
    componentSession <- (answers \ "components" \ id).asOpt[JsObject]
    answer <- (componentSession \ "answers").asOpt[JsValue]
  } yield answer
}
