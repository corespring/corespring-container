package org.corespring.container.logging

import grizzled.slf4j.{ Logger => GrizzledLogger }

private[corespring] object ContainerLogger {

  def getLogger(names: String*): GrizzledLogger = {
    val name = (Seq("org.corespring.container") ++ names).mkString(".")
    GrizzledLogger(name)
  }
}
