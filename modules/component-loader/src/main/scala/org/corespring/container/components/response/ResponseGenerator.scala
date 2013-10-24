package org.corespring.container.components.response

import org.corespring.container.js.ComponentServerLogic

class ResponseGenerator(override val componentType : String, definition: String) extends ComponentServerLogic {

  override def js: String = definition

}
