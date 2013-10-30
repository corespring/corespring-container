package org.corespring.container.components.outcome

import play.api.libs.json.{JsValue, JsObject, JsNumber, Json}

object DefaultOutcomeProcessor extends OutcomeProcessor {

  private def decimalize(v: BigDecimal, scale: Int = 2): Double =  v.setScale(scale, BigDecimal.RoundingMode.HALF_UP).toDouble

  def outcome(item: JsValue, session : JsValue, responses: JsValue): JsValue = {

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
        val score = (responses \ key \ "score").asOpt[BigDecimal].map(v => decimalize(v)).getOrElse(0.0)
        val weightedScore = decimalize(weight * score)

        acc ++ Json.obj(key -> Json.obj(
          "weight" -> JsNumber(weight),
          "score" -> JsNumber(score),
          "weightedScore" -> JsNumber(weightedScore)
        ))
    }

    val points = componentScores.fieldSet.map(fs => (fs._2 \ "weightedScore").as[BigDecimal]).foldRight[BigDecimal](0)(_ + _)
    val rawPercentage = (points / maxPoints) * 100
    val percentage = decimalize(rawPercentage, 1)

    val summary = Json.obj(
      "maxPoints" -> JsNumber(maxPoints),
      "points" -> JsNumber(points),
      "percentage" -> JsNumber(percentage)
    )

    Json.obj("summary" -> summary, "components" -> componentScores)
  }
}
