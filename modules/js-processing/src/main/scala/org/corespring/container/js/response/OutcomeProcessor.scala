package org.corespring.container.js.response

import org.corespring.container.components.response.{OutcomeProcessor => ContainerOutcomeProcessor}
import org.corespring.container.js.api.{GetServerLogic, JavascriptProcessingException}
import play.api.Logger
import play.api.libs.json.{JsNull, JsObject, JsValue}
import play.api.libs.json.Json._
trait Target {
  def targetId(question: JsValue) = (question \ "target" \ "id").asOpt[String]

  def hasTarget(question: JsValue) = targetId(question).isDefined
}

trait OutcomeProcessor
  extends ContainerOutcomeProcessor
  with Target
  with GetServerLogic {

  def missingAnswer(id:String) = s"missing answer for component with id: $id"

  def noAnswerOutcome(error:String) : JsObject = obj("correctness" -> "unknown", "error" -> error)

  def isInteraction(componentType: String): Boolean

  private lazy val logger = Logger(classOf[OutcomeProcessor])

  def createOutcome(item: JsValue, itemSession: JsValue, settings: JsValue): JsValue = {

    def createOutcomeForComponent(id: String, targetOutcome: JsValue, maybeAnswer: Option[JsValue]): (String, JsValue) = {
      val componentQuestions = (item \ "components").as[JsObject]
      val question = (componentQuestions \ id).as[JsObject]
      val componentType = (question \ "componentType").as[String]

      maybeAnswer.map{ answer =>
        try {
          val serverComponent = serverLogic(componentType)

          logger.trace(s""""all server logic:
                          |question: $question,
                          |answer: $answer,
                          |setting: $settings,
                          |targetOutcome: $targetOutcome""".stripMargin)

          val start = System.currentTimeMillis()
          val outcome = serverComponent.createOutcome(question, answer, settings, targetOutcome)
          logger.trace(s"outcome: $outcome")
          logger.info(s"${componentType} js execution duration (ms): ${System.currentTimeMillis() - start}")
          (id -> outcome)
        } catch {
          case  e: JavascriptProcessingException => {
            logger.error(s"JavascriptProcessingException: ${e.getMessage}")
            (id -> (noAnswerOutcome(e.getMessage)))
          }
        }
      }.getOrElse(id -> noAnswerOutcome(s"missing answer for component with id: $id"))
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
      val maybeAnswer = getAnswer(itemSession, key)
      createOutcomeForComponent(key, obj(), maybeAnswer)
    }

    val outcomesWithTarget: Seq[(String, JsValue)] = questionsThatNeedOutcomes.map { (kv) =>
      val (key, _) = kv
      questions.find(_._1 == key).map { q =>

        val id = targetId(q._2)

        if (id.isEmpty) {
          logger.trace(stringify(q._2))
        }
        require(id.isDefined, "targetId must be defined")
        val existingOutcome = outcomes.find(_._1 == id.get).map(_._2).getOrElse(JsObject(Seq.empty))

        /**
          * Note: we are implying that a component that needs an outcome from another component
          * does not need to retrieve an answer from the itemSession.
          * Currently this is the case, but it may need to change in future.
          */
        createOutcomeForComponent(key, existingOutcome, Some(JsNull))

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
