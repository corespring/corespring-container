package org.corespring.container.controllers

import org.corespring.container.components.response.ResponseProcessor
import org.corespring.container.player.actions.SessionActionBuilder
import org.corespring.container.services.SessionService
import play.api.Logger
import play.api.libs.json.JsBoolean
import play.api.libs.json.JsObject
import play.api.libs.json._
import play.api.mvc.{AnyContent, Controller}

trait Session extends Controller {

  private val logger = Logger("session")

  def sessionService: SessionService

  def responseProcessor: ResponseProcessor

  def sessionActions: SessionActionBuilder[AnyContent]

  def load(id: String) = sessionActions.load(id)(request => Ok((request.everything \ "session").as[JsValue]))

  def loadEverything(id: String) = sessionActions.loadEverything(id)(request => Ok(request.everything))

  /**
   * Ok(request.sessionJson)
   * @param id
   * @return
   */
  def submitAnswers(id: String) = sessionActions.loadEverything(id) {
    request =>

      request.body.asJson.map {
        answers =>

          val sessionJson: JsObject = (request.everything \ "session").as[JsObject]
          val itemJson: JsObject = (request.everything \ "item").as[JsObject]
          val isFinished: Boolean = (sessionJson \ "isFinished").asOpt[Boolean].getOrElse(false)
          val currentRemainingAttempts: Int = (sessionJson \ "remainingAttempts").asOpt[Int].getOrElse(
            (sessionJson \ "maxNoOfAttempts").as[Int]
          )

          if (isFinished) {
            Ok(
              Json.obj(
                "session" -> sessionJson,
                "responses" -> responseProcessor.respond(itemJson, sessionJson)
              )
            )
          } else {
            logger.debug(s"current remaining attempts for $id: $currentRemainingAttempts")

            def updateJson = {
              val newRemainingAttempts: Number = Math.max(0, currentRemainingAttempts - 1)
              val out = sessionJson ++ Json.obj(
                "remainingAttempts" -> JsNumber(newRemainingAttempts.intValue()),
                "answers" -> (answers \ "answers").as[JsObject],
                "isFinished" -> JsBoolean(newRemainingAttempts == 0)
              )
              logger.debug( s"update json: ${Json.stringify(out)}")
              out
            }

            sessionService.save(id, updateJson).map {
              update =>
                val responsesJson = if ((update \ "isFinished").as[Boolean]) {
                  Json.obj("responses" -> responseProcessor.respond(itemJson, update))
                } else {
                  JsObject(Seq.empty)
                }
                Ok(Json.obj("session" -> update) ++ responsesJson)
            }
          }.getOrElse(BadRequest("Error updading"))

      }.getOrElse(BadRequest("no json body"))
  }
}
