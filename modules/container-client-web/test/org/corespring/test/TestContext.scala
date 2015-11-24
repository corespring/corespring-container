package org.corespring.test

import org.corespring.container.client.HasContainerContext
import org.corespring.container.client.controllers.resources.SessionExecutionContext
import org.corespring.container.client.integration.ContainerExecutionContext

import scala.concurrent.ExecutionContext

trait TestContext extends HasContainerContext{

  override def containerContext: ContainerExecutionContext = new ContainerExecutionContext(ExecutionContext.global)

  def sessionContext = SessionExecutionContext(ExecutionContext.global, ExecutionContext.global)
}
