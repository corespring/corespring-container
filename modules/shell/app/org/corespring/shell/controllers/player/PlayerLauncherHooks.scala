package org.corespring.shell.controllers.player

import org.corespring.container.client.hooks
import org.corespring.container.client.hooks.PlayerJs
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.shell.SessionKeys
import play.api.mvc.RequestHeader

import scala.concurrent.Future

trait LoadJs {

  import scala.concurrent.ExecutionContext.Implicits.global

  //Implemented as trait so it can be tested without setup
  def loadJs(implicit header: RequestHeader): Future[PlayerJs] = Future {
    def isSecure = header.getQueryString("secure").exists(_ == "true")
    def errors = header.getQueryString("jsErrors").map {
      s => s.split(",").toSeq
    }.getOrElse(Seq())

    val updatedSession = header.getQueryString("pageErrors").map {
      s =>
        header.session + (SessionKeys.failLoadPlayer -> s)
    }.getOrElse {
      header.session - SessionKeys.failLoadPlayer
    }

    val testSW =
      """
        |
        | if( 'serviceWorker' in navigator ) {
        |  // ...
        |
        | }
      """.stripMargin
    PlayerJs(isSecure, updatedSession, errors, customJs = "//foo")
  }
}

class PlayerLauncherHooks(
                        val containerContext : ContainerExecutionContext
                         ) extends hooks.PlayerLauncherHooks{


    val loader = new LoadJs {}

    /**
      * Provides a few hooks so that you can simulate scenarios when loading player:
      * ?secure - a secure request
      * ?jsErrors  - throw errors when loading the player js
      * ?pageErrors - throw errors when loading the player page
      *
      * @return
      */

    override def playerJs(implicit header: RequestHeader): Future[PlayerJs] = loader.loadJs(header)

    override def editorJs(implicit header: RequestHeader): Future[PlayerJs] = loader.loadJs(header)

    override def catalogJs(implicit header: RequestHeader): Future[PlayerJs] = loader.loadJs(header)

    override def componentEditorJs(implicit header: RequestHeader): Future[PlayerJs] = loader.loadJs(header)
}
