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

  private val readers: mutable.Stack[Reader] = new  mutable.Stack[Reader]()

  private class InternalTemplateLoader(val root: String) extends TemplateLoader {

    import play.api.Play.current

    override def getLastModified(name: String): Long = Play.resource(s"$root/$name").map { url =>
      url.openConnection().getLastModified
    }.getOrElse { throw new RuntimeException(s"Unable to load jade file as a resource from: $root/$name") }

    override def getReader(name: String): Reader = Play.resource(s"$root/$name").map { url =>
      val returnValue = new BufferedReader(new InputStreamReader(url.openStream()))
      readers.push(returnValue)
      returnValue
    }.getOrElse { throw new RuntimeException(s"Unable to load jade file as a resource from: $root/$name") }
  }

  val jadeConfig = {
    val c = new JadeConfiguration
    c.setTemplateLoader(new InternalTemplateLoader("container-client"))
    c.setMode(Jade4J.Mode.HTML)
    c.setPrettyPrint(Play.mode == Mode.Dev)
    c
  }

  private def cleanupReaders() = {
    while(readers.length > 0) IOUtils.closeQuietly(readers.pop())
  }

  private def loadTemplate(name: String): JadeTemplate = {
    templates.get(name).getOrElse {
      val out = jadeConfig.getTemplate(name)
      templates.put(name, jadeConfig.getTemplate(name))
      cleanupReaders()
      out
    }
  }

  def renderJade(name: String, params: Map[String, Object]): Html = {
    import scala.collection.JavaConversions._
    val rendered = jadeConfig.renderTemplate(loadTemplate(name), params)
    Html(new StringBuilder(rendered).toString)
  }
}
