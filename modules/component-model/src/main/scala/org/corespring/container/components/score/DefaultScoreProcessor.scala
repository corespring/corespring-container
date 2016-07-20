package org.corespring.container.components.outcome

import org.corespring.container.components.score.ScoringType
import org.corespring.container.logging.ContainerLogger
import play.api.libs.json.{ JsNumber, JsObject, JsValue, Json }

trait DefaultScoreProcessor extends ScoreProcessor {

  def isComponentScoreable(compType: String, comp: JsValue, session: JsValue, outcome: JsValue): Boolean

  lazy val logger = ContainerLogger.getLogger("DefaultScoreProcessor")

  private def decimalize(v: BigDecimal, scale: Int = 2): Double = v.setScale(scale, BigDecimal.RoundingMode.HALF_UP).toDouble

  def score(item: JsValue, session: JsValue, outcomes: JsValue): JsValue = {
    logger.debug(s"[score] item")
    logger.trace(s"[score] item: ${Json.stringify(item)}")
    logger.trace(s"[score] session: ${Json.stringify(session)}")
    logger.trace(s"[score] outcomes: ${Json.stringify(outcomes)}")

    val scoringType: String = (item \ "config" \ "scoringType").asOpt[String].getOrElse(ScoringType.WEIGHTED)
    logger.trace(s"scoringType: $scoringType")

    lazy val scoreableComponents: Seq[(String, JsValue)] = (item \ "components").asOpt[JsObject].map { c =>

      c.fields.flatMap {
        case (key, json) =>

          require((json \ "componentType").asOpt[String].isDefined, "No component type specified")

          for {
            compType <- (json \ "componentType").asOpt[String]
            compSession <- (session \ "components" \ key).asOpt[JsValue].orElse(Some(Json.obj()))
            compOutcome <- (outcomes \ "components" \ key).asOpt[JsValue].orElse(Some(Json.obj()))
            if (isComponentScoreable(compType, json, compSession, compOutcome))
          } yield {
            (key, json)
          }
      }
    }.getOrElse {
      throw new RuntimeException(s"Json has no components field: ${Json.stringify(item)}")
    }

    logger.trace(s"scoreable components: ${Json.stringify(JsObject(scoreableComponents))}")

    val weights: Seq[(String, Int)] = scoreableComponents.map {
      case (key, json) =>
        logger.trace(s"model for: $key")
        (key, (json \ "weight").asOpt[Int].getOrElse(1))
    }.toSeq

    val componentScores = scoreableComponents.foldRight[JsObject](Json.obj()) {
      (tuple: (String, JsValue), acc: JsObject) =>
        val (key, _) = tuple
        val weight = weights.find(_._1 == key).map(_._2).getOrElse(-1)
        val score = (outcomes \ key \ "score").asOpt[BigDecimal].map(v => decimalize(v)).getOrElse(0.0)
        val weightedScore = decimalize(weight * score)

        logger.trace(s"[score] $key -> weight: $weight, score: $score, weightedScore: $weightedScore")

        acc ++ Json.obj(key -> Json.obj(
          "weight" -> JsNumber(weight),
          "score" -> JsNumber(score),
          "weightedScore" -> JsNumber(weightedScore)))
    }

    val maxPoints = weights.map(_._2).fold(0)(_ + _)
    val points = getSumOfWeightedScores(componentScores)
    val rawPercentage: BigDecimal = if (maxPoints == 0) 0 else (points / maxPoints) * 100
    val percentage = decimalize(rawPercentage, 1)

    def mkSummary(maxPoints:BigDecimal, points:BigDecimal, percentage:BigDecimal) = {
      Json.obj(
        "maxPoints" -> JsNumber(maxPoints),
        "points" -> JsNumber(points),
        "percentage" -> JsNumber(percentage))
    }

    val summary = if(scoringType == ScoringType.ALL_OR_NOTHING){
      if(maxPoints == points){
        mkSummary(maxPoints, maxPoints, 100.0)
      } else {
        mkSummary(maxPoints, 0.0, 0.0)
      }
    } else {
      mkSummary(maxPoints, points, percentage)
    }

    logger.trace(s"[score] summary: ${Json.stringify(summary)}")

    Json.obj("summary" -> summary, "components" -> componentScores)
  }

  def getSumOfWeightedScores(componentScores: JsObject) = {
    componentScores.fields.map(fs => (fs._2 \ "weightedScore").as[BigDecimal]).foldRight[BigDecimal](0)(_ + _)
  }

  def getNumberOfFullScores(componentScores: JsObject) = {
    componentScores.fields.map(fs => (fs._2 \ "score").as[Int]).filter(_ == 1).foldRight[Int](0)(_ + _)
  }
}
