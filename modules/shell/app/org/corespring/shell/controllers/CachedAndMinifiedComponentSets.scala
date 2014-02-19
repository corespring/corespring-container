package org.corespring.shell.controllers

import com.google.javascript.jscomp.{JSSourceFile, CompilerOptions}
import java.io.{StringWriter, StringReader}
import org.corespring.container.client.controllers.DefaultComponentSets
import play.api.cache.Cached
import play.api.http.ContentTypes
import play.api.mvc.{Result, EssentialAction}
import play.api.{Configuration, Play}
import com.typesafe.config.Config

/**
 * An example of component sets with caching.
 */
trait CachedAndMinifiedComponentSets extends DefaultComponentSets {

  import play.api.Play.current

  def configuration: Configuration

  def minifyJs(source: String, compilerOptions: Option[CompilerOptions] = None): Either[String, String] = {

    val compiler = new com.google.javascript.jscomp.Compiler()
    val extern = JSSourceFile.fromCode("externs.js", "function alert(x) {}")
    val options = compilerOptions.getOrElse(new CompilerOptions())
    val input = JSSourceFile.fromCode("generated", source)

    compiler.compile(extern, input, options).success match {
      case true => Right(compiler.toSource())
      case false => {
        Left(s"JS Errors: \n${compiler.getErrors.map(e => s"${e.description}: ${compiler.getSourceLine("generated", e.lineNumber)}").mkString("\n")}\n")
      }
    }
  }

  private def minifyCss(contents: String): Either[String, String] = {
    val compressor = new com.yahoo.platform.yui.compressor.CssCompressor(new StringReader(contents))
    val writer = new StringWriter()
    compressor.compress(writer, 0)
    Right(writer.toString)
  }

  def minifyEnabled = configuration.getBoolean("minify").getOrElse(false)

  def cachingEnabled = configuration.getBoolean("cache").getOrElse(false)

  override def process(s: String, contentType: String): Result = {
    val out: Either[String, String] = contentType match {
      case ss: String if ss == ContentTypes.JAVASCRIPT => if (minifyEnabled) minifyJs(s) else Right(s)
      case ss: String if ss == ContentTypes.CSS => if (minifyEnabled) minifyCss(s) else Right(s)
      case _ => Left(s"unknown content type: $contentType")
    }
    out match {
      case Right(s) => Ok(s).as(contentType)
      case Left(err) => BadRequest(err)
    }
  }

  override def resource[A >: EssentialAction](context: String, directive: String, suffix: String) = if (cachingEnabled) {
    Cached(s"$context-$directive-$suffix") {
      super.resource(context, directive, suffix)
    }
  } else {
    super.resource(context, directive, suffix)
  }


}
