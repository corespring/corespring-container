package org.corespring.container.components.services

import org.corespring.container.components.model.Component
import org.corespring.container.components.model.dependencies.ComponentMaker
import org.specs2.mutable.Specification
import org.specs2.specification.Scope

class ComponentServiceTest extends Specification with ComponentMaker {

  trait scope extends Scope {

    val service = new ComponentService {
      override def components: Seq[Component] = Seq(
        uiComp("released", Nil).copy(released = true),
        uiComp("not-released", Nil).copy(released = false))
    }
  }

  "interactions" should {
    "return 2 interactions - calling with no param" in new scope {
      service.interactions.length must_== 2
    }
  }
}
