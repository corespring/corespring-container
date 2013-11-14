package org.corespring.container.client.controllers

import play.api.mvc.{AnyContent, Action, Controller}

class File extends Controller {


  def at(file:String) : Action[AnyContent] = Action{ request =>

    //...

    Ok("?")
  }

}
