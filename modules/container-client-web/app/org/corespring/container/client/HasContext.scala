package org.corespring.container.client

import play.api.libs.concurrent.Akka

import scala.concurrent.ExecutionContext

import play.api.Play.current

trait HasContext {
  implicit def ec: ExecutionContext = Akka.system.dispatchers.lookup("akka.actor.item-session-api")
}
