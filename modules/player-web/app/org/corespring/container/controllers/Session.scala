package org.corespring.container.controllers

import org.corespring.container.player.actions.SessionActionBuilder
import org.corespring.container.services.{SessionService}
import play.api.libs.json._
import play.api.mvc.{AnyContent, Controller}
import org.corespring.container.components.response.ResponseProcessor
import play.api.libs.json.JsObject
import play.api.libs.json.JsBoolean

trait Session extends Controller {

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
          val currentRemainingAttempts : Int = (sessionJson \ "remainingAttempts").asOpt[Int].getOrElse(
            (sessionJson \ "maxNoAttempts").as[Int]
          )

          def updateJson = {
            val newRemainingAttempts: Number = currentRemainingAttempts - 1
            Json.obj(
              "remainingAttempts" -> JsNumber(newRemainingAttempts.intValue()),
              "answers" -> (answers \ "answers").as[JsObject],
              "isFinished" -> JsBoolean(newRemainingAttempts == 0)
            )
          }

          sessionService.save(id,updateJson).map {
            update =>
              val responses = responseProcessor.respond(itemJson, update)
              Ok(Json.obj(
                "session" -> update,
                "responses" -> responses
              ))
          }.getOrElse(BadRequest("Error updading"))

      }.getOrElse(BadRequest("no json body"))
  }
}
