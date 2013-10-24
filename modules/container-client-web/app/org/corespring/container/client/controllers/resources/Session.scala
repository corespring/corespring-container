package org.corespring.container.client.controllers.resources

import org.corespring.container.client.actions.{SubmitAnswersRequest, SessionActionBuilder}
import org.corespring.container.client.controllers.resources.session.ItemPruner
import org.corespring.container.components.outcome.OutcomeProcessor
import org.corespring.container.components.response.ResponseProcessor
import org.joda.time.DateTime
import play.api.Logger
import play.api.libs.json._
import play.api.mvc.{AnyContent, Controller}

trait Session extends Controller with ItemPruner {

  val logger = Logger("session")

  def responseProcessor: ResponseProcessor

  def outcomeProcessor: OutcomeProcessor

  def builder: SessionActionBuilder[AnyContent]

  def load(id: String) = builder.load(id)(request => Ok((request.everything \ "session").as[JsValue]))

  def loadEverything(id: String) = builder.loadEverything(id){ request =>



    val itemJson = (request.everything \ "item").as[JsObject]
    val prunedItem = pruneItem(itemJson)
    val sessionJson = (request.everything \ "session").as[JsObject]
    val isFinished = (sessionJson \ "isFinished").asOpt[Boolean].getOrElse(false)

    if(!isFinished) {
      Ok(
        Json.obj(
          "item" -> prunedItem,
          "session" -> sessionJson)
      )
    } else {
      val responses = responseProcessor.respond(itemJson, sessionJson)
      val outcome = outcomeProcessor.outcome(itemJson, sessionJson, responses)
      val out = Json.obj(
        "item" -> prunedItem,
        "responses" -> responses,
        "outcome" -> outcome,
        "session" -> sessionJson)
      Ok(out)
    }
  }

  /**
   * Ok(request.sessionJson)
   * @param id
   * @return
   */

  def submitAnswers(id: String) = builder.submitAnswers(id) {
    request : SubmitAnswersRequest[AnyContent] =>

      request.body.asJson.map {
        answers =>

          val sessionJson: JsObject = {
            val session = (request.everything \ "session").as[JsObject]
            (session \ "start").asOpt[JsNumber].map {
              s =>
                session
            }.getOrElse(session ++ Json.obj("start" -> JsNumber(DateTime.now.getMillis)))
          }

          val itemJson: JsObject = (request.everything \ "item").as[JsObject]
          val isFinished: Boolean = (sessionJson \ "isFinished").asOpt[Boolean].getOrElse(false)
          val currentRemainingAttempts: Int = (sessionJson \ "remainingAttempts").asOpt[Int].getOrElse(
            (sessionJson \ "settings" \ "maxNoOfAttempts").as[Int]
          )

          def output(session: JsValue, isFinished: Boolean) = {
            val base = Json.obj("session" -> session)
            if (isFinished) {
              val responses = responseProcessor.respond(itemJson, session)
              val outcome = outcomeProcessor.outcome(itemJson, session, responses)
              base ++ Json.obj("responses" -> responses) ++ Json.obj("outcome" -> outcome)
            } else {
              base
            }
          }

          if (isFinished) {
            Ok(output(sessionJson, true))
          } else {
            logger.debug(s"current remaining attempts for $id: $currentRemainingAttempts")

            def updateJson = {

              val newRemainingAttempts: Number = Math.max(0, currentRemainingAttempts - 1)
              val finished = newRemainingAttempts == 0

              val updates: Seq[(String, JsValue)] = Seq(
                "remainingAttempts" -> JsNumber(newRemainingAttempts.intValue()),
                "answers" -> (answers \ "answers").as[JsObject],
                "isFinished" -> JsBoolean(finished))

              val maybes: Seq[(String, JsValue)] = Seq(
                if (finished) Some(("finish" -> JsNumber(DateTime.now.getMillis))) else None
              ).flatten

              val out: JsObject = sessionJson ++ JsObject(updates ++ maybes)

              logger.debug( s"update json: ${Json.stringify(out)}")
              out
            }

            request.saveSession(id, updateJson).map {
              update =>
                if ((update \ "isFinished").as[Boolean]) {
                  Ok(output(update, true))
                } else {
                  Ok(output(update, false))
                }
            }
          }.getOrElse(BadRequest("Error updading"))

      }.getOrElse(BadRequest("no json body"))
  }
}
