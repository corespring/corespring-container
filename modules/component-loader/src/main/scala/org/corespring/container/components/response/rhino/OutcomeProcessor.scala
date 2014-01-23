package org.corespring.container.components.response.rhino

import org.corespring.container.components.model.{Library, UiComponent}
import org.corespring.container.components.response.{OutcomeGenerator, OutcomeProcessor => ContainerOutcomeProcessor}
import org.slf4j.LoggerFactory
import play.api.libs.json.{Json, JsObject, JsValue}

class OutcomeProcessor(components: Seq[UiComponent], libraries: Seq[Library]) extends ContainerOutcomeProcessor {

  private lazy val logger = LoggerFactory.getLogger("components.outcome")

  def createOutcome(item: JsValue, itemSession: JsValue, settings: JsValue): JsValue = {

    require( (itemSession \ "components").asOpt[JsObject].isDefined, "The item session has no 'components' key")

    def createOutcomeForComponent(id: String, targetOutcome: JsValue): (String, JsValue) = {
      val componentQuestions = (item \ "components").as[JsObject]
      val question = (componentQuestions \ id).as[JsObject]
      val componentType = (question \ "componentType").as[String]

      val answer = getAnswer(itemSession, id)

      components.find(_.matchesType(componentType)).map {
        component =>

          answer.map {
            a =>
              val componentLibraries: Seq[Library] = component.libraries.map(id => libraries.find(l => l.id.matches(id))).flatten
              val generator = new OutcomeGenerator(component.componentType, component.server.definition, componentLibraries)
              val outcome = generator.createOutcome(question, a, settings, targetOutcome)
              logger.trace(s"outcome: $outcome")
              (id -> outcome)
          }.getOrElse {
            logger.debug(s"no answer provided for: $id")
            (id, JsObject(Seq.empty))
          }
      }.getOrElse((id, JsObject(Seq.empty)))

    }

    val questions : Seq[(String,JsValue)] = (item \ "components").as[JsObject].fields

    def getTargetId(json:JsValue) = (json \ "target" \ "id").asOpt[String]

    def questionTargets(key:String)  = { questions.exists{ kv =>
      val (_,json) = kv
      getTargetId(json).isDefined
    }}


    val (noTargets, withTargets) = questions.partition{
      case kv : (String,JsValue) if !questionTargets(kv._1) => true
      case _ => false
    }

    val outcomesNoTarget = noTargets.map{ (kv) =>
      val (key, _) = kv
      createOutcomeForComponent(key, Json.obj())
    }

    val outcomesWithTarget = withTargets.map{ (kv) =>
      val (key, json) = kv
      val targetId = getTargetId(json)
      require(targetId.isDefined, "targetId must be defined")
      val existingOutcome = outcomesNoTarget.find(_._1 == targetId.get).map(_._2).getOrElse(JsObject(Seq.empty))
      createOutcomeForComponent(key,existingOutcome)
    }

    JsObject((outcomesNoTarget ++ outcomesWithTarget).toSeq)
  }

  private def getAnswer(answers: JsValue, id: String): Option[JsValue] = for {
    componentSession <- (answers \ "components" \ id).asOpt[JsObject]
    answer <- (componentSession \ "answers").asOpt[JsValue]
  } yield answer
}
