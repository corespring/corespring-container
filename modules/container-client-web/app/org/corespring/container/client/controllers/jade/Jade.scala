package org.corespring.container.client.controllers.jade

import java.io.{ BufferedReader, InputStreamReader, Reader }

import de.neuland.jade4j.template.{ JadeTemplate, TemplateLoader }
import de.neuland.jade4j.{ Jade4J, JadeConfiguration }
import org.apache.commons.io.IOUtils
import play.api.templates.Html
import play.api.{ Mode, Play }

import scala.collection.mutable

trait Jade {

  import play.api.Play.current

  private val templates: mutable.Map[String, JadeTemplate] = mutable.Map()

  private val readers: mutable.Stack[Reader] = new mutable.Stack[Reader]()

  private class InternalTemplateLoader(val root: String) extends TemplateLoader {

    import play.api.Play.current

    private def toPath(name:String) = s"$root/$name.jade"

    override def getLastModified(name: String): Long = Play.resource(toPath(name)).map { url =>
      url.openConnection().getLastModified
    }.getOrElse { throw new RuntimeException(s"Unable to load jade file as a resource from: ${toPath(name)}") }

    override def getReader(name: String): Reader = Play.resource(toPath(name)).map { url =>
      val returnValue = new BufferedReader(new InputStreamReader(url.openStream()))
      readers.push(returnValue)
      returnValue
    }.getOrElse { throw new RuntimeException(s"Unable to load jade file as a resource from: ${toPath(name)}") }
  }

  val jadeConfig = {
    val c = new JadeConfiguration
    c.setTemplateLoader(new InternalTemplateLoader("container-client"))
    c.setMode(Jade4J.Mode.HTML)
    c.setPrettyPrint(Play.mode == Mode.Dev)
    c
  }

  private def cleanupReaders() = {
    while (readers.length > 0) IOUtils.closeQuietly(readers.pop())
  }

  private def loadTemplate(name: String): JadeTemplate = {

    def readIn = {
      val out = jadeConfig.getTemplate(name)
      templates.put(name, jadeConfig.getTemplate(name))
      cleanupReaders()
      out
    }

    if (current.mode == Mode.Dev) {
      jadeConfig.clearCache()
      readIn
    } else templates.get(name).getOrElse { readIn }
  }

  def renderJade(name: String, params: Map[String, Object]): Html = {
    require(params != null, "params is null")
    import scala.collection.JavaConversions._
    val template = loadTemplate(name)
    println(s"-> template $template")
    println(s"-> params $params")
    println(s"-> name $name")
    val rendered = jadeConfig.renderTemplate(template, params)
    Html(new StringBuilder(rendered).toString)
  }
}
