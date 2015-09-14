package org.corespring.container.client

import org.corespring.container.client.integration.ContainerExecutionContext

trait HasContext {
  implicit def ec: ContainerExecutionContext
}
