package org.corespring.test

import org.corespring.container.client.HasContext
import org.corespring.container.client.integration.ContainerExecutionContext

import scala.concurrent.ExecutionContext

trait TestContext extends HasContext{
  override implicit def ec: ContainerExecutionContext = new ContainerExecutionContext(ExecutionContext.global)
}
