package org.corespring.container.js.response.rhino

import org.corespring.container.components.model.{UiComponent, Library}
import org.corespring.container.components.response.{OutcomeProcessor => ContainerOutcomeProcessor}
import org.slf4j.LoggerFactory
import play.api.libs.json.{Json, JsObject, JsValue}


trait Target{

  def targetId(question:JsValue) = (question \ "target" \ "id").asOpt[String]
  def hasTarget(question:JsValue) = targetId(question).isDefined
}


class OutcomeProcessor(components: Seq[UiComponent], libraries: Seq[Library]) extends ContainerOutcomeProcessor with Target{

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

    val (normalQuestions, questionsThatNeedOutcomes) = questions.partition{ kv =>
      !hasTarget(kv._2)
    }

    val outcomes : Seq[(String,JsValue)] = normalQuestions.map{ (kv) =>
      val (key, _) = kv
      createOutcomeForComponent(key, Json.obj())
    }

    val outcomesWithTarget : Seq[(String, JsValue)] = questionsThatNeedOutcomes.map{ (kv) =>
      val (key, _) = kv
      questions.find( _._1 == key).map{ q =>

        val id = targetId(q._2)

        if(id.isEmpty){
          logger.trace(Json.stringify(q._2))
        }
        require(id.isDefined, "targetId must be defined")
        val existingOutcome = outcomes.find(_._1 == id.get).map(_._2).getOrElse(JsObject(Seq.empty))
        createOutcomeForComponent(key,existingOutcome)

      }.getOrElse(throw new RuntimeException(s"Can't find a question with key: $key"))

    }

    val out : Seq[(String,JsValue)] = outcomes ++ outcomesWithTarget
    JsObject(out)
  }

  private def getAnswer(answers: JsValue, id: String): Option[JsValue] = for {
    componentSession <- (answers \ "components" \ id).asOpt[JsObject]
    answer <- (componentSession \ "answers").asOpt[JsValue]
  } yield answer
}
