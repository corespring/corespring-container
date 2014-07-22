package org.corespring.container.production.processing

import java.io.{ StringWriter, StringReader }

trait CssMinifier {

  def minifyCss(contents: String): Either[String, String] = {
    val compressor = new com.yahoo.platform.yui.compressor.CssCompressor(new StringReader(contents))
    val writer = new StringWriter()
    compressor.compress(writer, 0)
    Right(writer.toString)
  }
}
