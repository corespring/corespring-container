package org.corespring.container.js.response.rhino

import org.corespring.container.js.ComponentServerLogic
import org.corespring.container.components.model.Library

class OutcomeGenerator(override val componentType: String, definition: String, libraries: Seq[Library]) extends ComponentServerLogic {

  override def js: String = definition

  def componentLibs: Seq[(String, String)] = libraries.map(l => l.server.map(s => (s.name, s.source))).flatten
}
