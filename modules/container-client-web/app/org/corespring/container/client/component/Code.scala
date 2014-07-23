package org.corespring.container.client.component

trait CodeMaker {
  def makeJs(e: (String, String)*): String
}

trait DefaultCodeMaker extends CodeMaker {

  override def makeJs(e: (String, String)*): String = {
    val sb = new StringBuilder()
    e.foldLeft(sb)((acc, v) => {
      val (n, src) = v
      acc.append(s"// - $n\n$src\n// -")
    })
    sb.toString
  }
}
