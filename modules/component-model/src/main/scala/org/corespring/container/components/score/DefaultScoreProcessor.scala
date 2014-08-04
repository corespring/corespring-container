package org.corespring.container.components.outcome

import org.corespring.container.logging.ContainerLogger
import play.api.libs.json.{ JsValue, JsObject, JsNumber, Json }

object DefaultScoreProcessor extends ScoreProcessor {

  lazy val logger = ContainerLogger.getLogger("DefaultScoreProcessor")

  private def decimalize(v: BigDecimal, scale: Int = 2): Double = v.setScale(scale, BigDecimal.RoundingMode.HALF_UP).toDouble

  def score(item: JsValue, session: JsValue, outcomes: JsValue): JsValue = {
    logger.debug(s"[score] item")
    logger.trace(s"[score] item: ${Json.stringify(item)}")
    logger.trace(s"[score] session: ${Json.stringify(session)}")
    logger.trace(s"[score] outcomes: ${Json.stringify(outcomes)}")

    val components = (item \ "components").as[JsObject]

    val weights: Seq[(String, Int)] = components.keys.map {
      k =>
        val comp = (item \ "components" \ k).as[JsObject]
        (k, (comp \ "weight").asOpt[Int].getOrElse(1))
    }.toSeq

    val maxPoints = weights.map(_._2).fold(0)(_ + _)

    val componentScores = components.keys.foldRight[JsObject](Json.obj()) {
      (key: String, acc: JsObject) =>

        val weight = weights.find(_._1 == key).map(_._2).getOrElse(-1)
        val score = (outcomes \ key \ "score").asOpt[BigDecimal].map(v => decimalize(v)).getOrElse(0.0)
        val weightedScore = decimalize(weight * score)

        logger.trace(s"[score] $key -> weight: $weight, score: $score, weightedScore: $weightedScore")

        acc ++ Json.obj(key -> Json.obj(
          "weight" -> JsNumber(weight),
          "score" -> JsNumber(score),
          "weightedScore" -> JsNumber(weightedScore)))
    }

    val points = getSumOfWeightedScores(componentScores)
    val rawPercentage = (points / maxPoints) * 100
    val percentage = decimalize(rawPercentage, 1)

    val summary = Json.obj(
      "maxPoints" -> JsNumber(maxPoints),
      "points" -> JsNumber(points),
      "percentage" -> JsNumber(percentage))

    logger.trace(s"[score] summary: ${Json.stringify(summary)}")

    Json.obj("summary" -> summary, "components" -> componentScores)
  }

  def getSumOfWeightedScores(componentScores: JsObject) = {
    componentScores.fields.map(fs => (fs._2 \ "weightedScore").as[BigDecimal]).foldRight[BigDecimal](0)(_ + _)
  }
}
