package org.corespring.container.js.response

import org.corespring.container.components.model.dependencies.{ ComponentSplitter, DependencyResolver }
import org.corespring.container.components.model.{ Component, Interaction, Library }
import org.corespring.container.components.response.{ OutcomeProcessor => ContainerOutcomeProcessor }
import org.corespring.container.js.api.GetServerLogic
import play.api.libs.json._
import org.corespring.container.logging.ContainerLogger
trait Target {
  def targetId(question: JsValue) = (question \ "target" \ "id").asOpt[String]

  def hasTarget(question: JsValue) = targetId(question).isDefined
}

trait OutcomeProcessor
  extends ContainerOutcomeProcessor
  with Target
  with GetServerLogic with ComponentSplitter {

  lazy val dependencyResolver = new DependencyResolver {
    override def components: Seq[Component] = OutcomeProcessor.this.components
  }

  def components: Seq[Component]

  private lazy val logger = ContainerLogger.getLogger("OutcomeProcessor")

  def createOutcome(item: JsValue, itemSession: JsValue, settings: JsValue): JsValue = {

    def createOutcomeForComponent(id: String, targetOutcome: JsValue): (String, JsValue) = {
      val componentQuestions = (item \ "components").as[JsObject]
      val question = (componentQuestions \ id).as[JsObject]
      val componentType = (question \ "componentType").as[String]

      val answer = getAnswer(itemSession, id).getOrElse {
        logger.debug(s"No answer provided for $id - defaulting to null")
        JsNull(0)
      }

      def getInteraction(t: String): Option[Interaction] = components.find(_.matchesType(componentType)).map { c =>
        if (c.isInstanceOf[Interaction]) {
          c.asInstanceOf[Interaction]
        } else {
          throw new RuntimeException(s"[OutcomeProcessor] component type: $t is not an Interaction")
        }
      }

      getInteraction(componentType).map {
        component =>
          val sortedLibs = dependencyResolver.filterByType[Library](dependencyResolver.resolveComponents(Seq(component.id)).filterNot(_.id.orgNameMatch(component.id)))
          val serverComponent = serverLogic(component.componentType, component.server.definition, sortedLibs)
          logger.trace(s"call server logic: \nquestion: $question, \nanswer: $answer, \nsetting: $settings, \ntargetOutcome: $targetOutcome")
          val start = System.currentTimeMillis()
          val outcome = serverComponent.createOutcome(question, answer, settings, targetOutcome)
          logger.trace(s"outcome: $outcome")
          logger.debug(s"js execution duration (ms): ${System.currentTimeMillis() - start}")
          println(s"js execution duration (ms): ${System.currentTimeMillis() - start}")
          (id -> outcome)
      }.getOrElse((id, JsObject(Seq.empty)))

    }

    def canHaveOutcome(t: (String, JsValue)): Boolean = {
      val componentType = (t._2 \ "componentType").as[String]
      interactions.exists(_.matchesType(componentType))
    }

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
