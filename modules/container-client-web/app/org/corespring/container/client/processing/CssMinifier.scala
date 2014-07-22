package org.corespring.container.client.processing

import java.io.{StringReader, StringWriter}

trait CssMinifier {

  def minifyCss(contents: String): Either[String, String] = {
    val compressor = new com.yahoo.platform.yui.compressor.CssCompressor(new StringReader(contents))
    val writer = new StringWriter()
    compressor.compress(writer, 0)
    Right(writer.toString)
  }
}
