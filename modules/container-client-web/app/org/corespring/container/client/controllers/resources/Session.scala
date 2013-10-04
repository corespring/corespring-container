package org.corespring.container.client.controllers.resources

import org.corespring.container.client.actions.{SubmitAnswersRequest, SessionActionBuilder}
import org.corespring.container.components.response.ResponseProcessor
import play.api.Logger
import play.api.libs.json._
import play.api.mvc.{AnyContent, Controller}

trait Session extends Controller {

  private val logger = Logger("session")

  def responseProcessor: ResponseProcessor

  def builder: SessionActionBuilder[AnyContent]

  def load(id: String) = builder.load(id)(request => Ok((request.everything \ "session").as[JsValue]))

  def loadEverything(id: String) = builder.loadEverything(id)(request => Ok(request.everything))

  /**
   * Ok(request.sessionJson)
   * @param id
   * @return
   */
  def submitAnswers(id: String) = builder.submitAnswers(id) {
    request : SubmitAnswersRequest[AnyContent] =>

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

            request.saveSession(id, updateJson).map {
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
