package org.corespring.container.js.rhino

import org.corespring.container.components.model.Library
import org.corespring.container.js.api.GetServerLogic
import org.corespring.container.js.rhino.{ ComponentServerLogic => RhinoComponentServerLogic }

class RhinoServerLogic extends GetServerLogic {

  override def serverLogic(compType: String, definition: String, componentLibraries: Seq[Library]): ComponentServerLogic = {
    new RhinoComponentServerLogic {

      override def componentType: String = compType

      override def js: String = definition

      override def componentLibs: Seq[(String, String)] = toNameAndSource(componentLibraries)

      def toNameAndSource(s: Seq[Library]): Seq[(String, String)] = s.map(l => l.server.map(s => (s.name, s.source))).flatten

    }
  }
}
