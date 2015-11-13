package org.corespring.test

import org.corespring.container.client.HasContainerContext
import org.corespring.container.client.controllers.resources.SessionContext
import org.corespring.container.client.integration.ContainerExecutionContext

import scala.concurrent.ExecutionContext

trait TestContext extends HasContainerContext{

  override def containerContext: ContainerExecutionContext = new ContainerExecutionContext(ExecutionContext.global)

  def sessionContext = SessionContext(ExecutionContext.global, ExecutionContext.global)
}
