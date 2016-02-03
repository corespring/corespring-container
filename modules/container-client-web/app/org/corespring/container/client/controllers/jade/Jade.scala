package org.corespring.container.client.controllers.jade

import java.io.{ BufferedReader, InputStreamReader, Reader }

import de.neuland.jade4j.exceptions.JadeLexerException
import de.neuland.jade4j.template.{ JadeTemplate, TemplateLoader }
import de.neuland.jade4j.{ Jade4J, JadeConfiguration }
import grizzled.slf4j.Logger
import org.apache.commons.io.IOUtils
import org.corespring.container.client.controllers.apps.TemplateParams
import play.api.Mode.Mode
import play.api.{ Mode, Play }
import play.api.templates.Html

import scala.collection.mutable


trait GetParams{
  def params: Map[String,Any]
}

trait Renderer {
  def render(template:String, params: GetParams) : Html
}

trait Jade {

  def logger: Logger

  def mode: Mode

  import play.api.Play.current

  private val templates: mutable.Map[String, JadeTemplate] = mutable.Map()

  private val readers: mutable.Stack[Reader] = new mutable.Stack[Reader]()

  private class InternalTemplateLoader(val root: String) extends TemplateLoader {

    private def toPath(name: String) = {
      s"$root/$name${if (name.endsWith(".jade")) "" else ".jade"}"
    }

    override def getLastModified(name: String): Long = Play.resource(toPath(name)).map { url =>
      url.openConnection().getLastModified
    }.getOrElse { throw new RuntimeException(s"getLastModified - Unable to load jade file as a resource from: ${toPath(name)}") }

    override def getReader(name: String): Reader = {
      logger.trace(s"getReader name=$name")
      val expandedPath = toPath(name)
      Play.resource(expandedPath).map { url =>
        val returnValue = new BufferedReader(new InputStreamReader(url.openStream()))
        readers.push(returnValue)
        returnValue
      }.getOrElse { throw new RuntimeException(s"getReader - Unable to load jade file as a resource from: ${expandedPath}") }
    }
  }

  val jadeConfig = {
    val c = new JadeConfiguration
    c.setTemplateLoader(new InternalTemplateLoader("container-client/jade"))
    c.setMode(Jade4J.Mode.HTML)
    c.setPrettyPrint(mode == Mode.Dev)
    c
  }

  private def cleanupReaders() = {
    readers.foreach { r =>
      IOUtils.closeQuietly(r)
    }
    readers.clear()
  }

  private def loadTemplate(name: String): JadeTemplate = {

    def readIn = try {
      val out = jadeConfig.getTemplate(name)
      templates.put(name, out)
      cleanupReaders()
      out
    } catch {
      case jle: JadeLexerException => {
        val line = jle.getTemplateLines.get(jle.getLineNumber)
        logger.error(s"jade error: ${jle.getFilename}, line no: ${jle.getLineNumber}\n> $line")
        throw jle
      }
      case t: Throwable => throw t
    }

    if (mode == Mode.Dev) {
      jadeConfig.clearCache()
      readIn
    } else templates.get(name).getOrElse { readIn }
  }

  def renderJade(params: TemplateParams): Html = {
    require(params != null, "params is null")
    import scala.collection.JavaConversions._
    val template = loadTemplate(params.appName)
    logger.trace(s"function=renderJade template=$template")
    logger.trace(s"function=renderJade params=$params")
    val rendered = jadeConfig.renderTemplate(template, params.toJadeParams)
    Html(new StringBuilder(rendered).toString)
  }
}
