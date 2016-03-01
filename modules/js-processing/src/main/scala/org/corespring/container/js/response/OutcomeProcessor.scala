package org.corespring.container.js.response

import org.corespring.container.components.response.{OutcomeProcessor => ContainerOutcomeProcessor}
import org.corespring.container.js.api.GetServerLogic
import play.api.Logger
import play.api.libs.json._

trait Target {
  def targetId(question: JsValue) = (question \ "target" \ "id").asOpt[String]

  def hasTarget(question: JsValue) = targetId(question).isDefined
}

trait OutcomeProcessor
  extends ContainerOutcomeProcessor
  with Target
  with GetServerLogic {

  def isInteraction(componentType: String): Boolean

  private lazy val logger = Logger(classOf[OutcomeProcessor])

  def createOutcome(item: JsValue, itemSession: JsValue, settings: JsValue): JsValue = {

    def createOutcomeForComponent(id: String, targetOutcome: JsValue): (String, JsValue) = {
      val componentQuestions = (item \ "components").as[JsObject]
      val question = (componentQuestions \ id).as[JsObject]
      val componentType = (question \ "componentType").as[String]

      val answer = getAnswer(itemSession, id).getOrElse {
        logger.debug(s"No answer provided for $id - defaulting to null")
        JsNull(0)
      }

      val serverComponent = serverLogic(componentType)
      logger.trace(s"call server logic: \nquestion: $question, \nanswer: $answer, \nsetting: $settings, \ntargetOutcome: $targetOutcome")
      val start = System.currentTimeMillis()
      val outcome = serverComponent.createOutcome(question, answer, settings, targetOutcome)
      logger.trace(s"outcome: $outcome")
      logger.info(s"${componentType} js execution duration (ms): ${System.currentTimeMillis() - start}")
      (id -> outcome)

    }

    def canHaveOutcome(t: (String, JsValue)): Boolean = (t._2 \ "componentType").asOpt[String].map { ct =>
      isInteraction(ct)
    }.getOrElse(false)

    val questions: Seq[(String, JsValue)] = (item \ "components").as[JsObject].fields.filter(canHaveOutcome)

    val (normalQuestions, questionsThatNeedOutcomes) = questions.partition { kv =>
      !hasTarget(kv._2)
    }

    val outcomes: Seq[(String, JsValue)] = normalQuestions.map { (kv) =>
      val (key, _) = kv
      createOutcomeForComponent(key, Json.obj())
    }

    val outcomesWithTarget: Seq[(String, JsValue)] = questionsThatNeedOutcomes.map { (kv) =>
      val (key, _) = kv
      questions.find(_._1 == key).map { q =>

        val id = targetId(q._2)

        if (id.isEmpty) {
          logger.trace(Json.stringify(q._2))
        }
        require(id.isDefined, "targetId must be defined")
        val existingOutcome = outcomes.find(_._1 == id.get).map(_._2).getOrElse(JsObject(Seq.empty))
        createOutcomeForComponent(key, existingOutcome)

      }.getOrElse(throw new RuntimeException(s"Can't find a question with key: $key"))

    }

    val out: Seq[(String, JsValue)] = outcomes ++ outcomesWithTarget
    JsObject(out)
  }

  private def getAnswer(answers: JsValue, id: String): Option[JsValue] = for {
    componentSession <- (answers \ "components" \ id).asOpt[JsObject]
    answer <- (componentSession \ "answers").asOpt[JsValue]
  } yield answer
}
