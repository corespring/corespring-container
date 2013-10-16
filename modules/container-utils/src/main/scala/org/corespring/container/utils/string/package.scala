package org.corespring.container.utils

package object string {

  def jsonSafe(s: String): String = {
    s.trim
      .replace("\"", "\\\"")
      .replace("\n", "\\n")
      .replace("/", "\\/")
  }

}
