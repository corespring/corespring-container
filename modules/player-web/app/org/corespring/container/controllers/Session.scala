package org.corespring.container.controllers

import org.corespring.container.player.actions.SessionActionBuilder
import play.api.mvc.{AnyContent, Controller}

trait Session extends Controller {

  def sessionActions: SessionActionBuilder[AnyContent]

  def load(id: String) = sessionActions.load(id)(request => Ok(request.sessionJson))
  def loadEverything(id: String) = sessionActions.loadEverything(id)(request => Ok(request.everything))
  def save(id: String) = sessionActions.save(id)(request => Ok(request.sessionJson))
}
