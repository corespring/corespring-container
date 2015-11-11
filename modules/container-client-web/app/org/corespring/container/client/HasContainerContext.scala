package org.corespring.container.client

import org.corespring.container.client.integration.ContainerExecutionContext

trait HasContainerContext {

  object ContainerContextId extends Enumeration {
    type ContainerContextId = Value
    val DEFAULT, OUTCOME, COMPONENT_SETS = Value
  }

  def containerContext: ContainerExecutionContext
  implicit val executionContext = containerContext.context

  def containerContextById(id:ContainerContextId.ContainerContextId) = containerContext.context

}
