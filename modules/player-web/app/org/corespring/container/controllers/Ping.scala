package org.corespring.container.controllers

import play.api.mvc.{Action, Controller}

object Ping extends Controller {


  def ping(id:String) = Action{Ok(id)}

}
