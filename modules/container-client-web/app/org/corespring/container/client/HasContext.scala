package org.corespring.container.client

import scala.concurrent.ExecutionContext

trait HasContext {
  implicit def ec: ExecutionContext = ExecutionContext.Implicits.global
}
