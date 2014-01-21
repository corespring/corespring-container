package org.corespring.container.utils

package object string {

  @deprecated("Use StringEscapeUtils#escapeJavascript instead")
  def jsonSafe(s: String): String = {
    s.trim
      .replace("\"", "\\\"")
      .replace("\n", "\\n")
      .replace("/", "\\/")
  }

  def hyphenatedToTitleCase(s:String) =   s.split("-").map(_.capitalize).mkString("")

  def join(delimiter:String, s:String*) = s.mkString(delimiter)

}
