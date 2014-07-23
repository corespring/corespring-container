package org.corespring.container.utils

package object string {

  def hyphenatedToTitleCase(s: String) = s.split("-").map(_.capitalize).mkString("")

  def join(delimiter: String, s: String*): String = s.mkString(delimiter)

}

