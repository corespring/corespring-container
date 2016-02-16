package org.corespring.container.client.controllers.apps

case class ContextAndSuffix(context: String, suffix: String)

trait PageSourceService {
  def loadJs(key: String): NgSourcePaths
  def loadCss(key: String): CssSourcePaths
}

import java.net.URL

import play.api.Logger
import play.api.libs.json.JsValue
import play.api.libs.json.Json

import scala.collection.mutable

case class PageSourceServiceConfig(prefix: String, reload: Boolean, load: String => Option[URL])

class JsonPageSourceService(config: PageSourceServiceConfig) extends PageSourceService {

  private val logger = Logger(classOf[JsonPageSourceService])

  private val reports: mutable.Map[ContextAndSuffix, SourcePaths] = mutable.Map.empty

  def reportName(contextAndSuffix: ContextAndSuffix): String = {
    val suffix = contextAndSuffix.suffix
    val context = contextAndSuffix.context
    val out = s"container-client/$context-$suffix-report.json"
    logger.debug(s"function=reportName, contextAndSuffix=$contextAndSuffix, out=$out")
    out
  }

  private def load[A <: SourcePaths](contextAndSuffix: ContextAndSuffix, load: (String) => A): A = {
    logger.info(s"function=load, contextAndSuffix=$contextAndSuffix")
    (reports.get(contextAndSuffix), config.reload) match {
      case (Some(sp), false) => sp.asInstanceOf[A]
      case _ => {
        val path = reportName(contextAndSuffix)
        val report = load(path)
        reports.put(contextAndSuffix, report)
        report
      }
    }
  }

  private def pathToJson(path: String): Option[JsValue] = {
    config.load(path).map { url =>
      val bs = scala.io.Source.fromURL(url)
      val jsonString: String = bs.getLines().mkString("\n")
      bs.close()
      val json = Json.parse(jsonString)
      json
    }
  }

  override def loadJs(key: String): NgSourcePaths = {
    load[NgSourcePaths](ContextAndSuffix(key, "js"), path => {
      val json = pathToJson(path).getOrElse(throw new IllegalArgumentException(s"Can't load path $path"))
      SourcePaths.js(config.prefix, json).getOrElse(throw new IllegalStateException("Can't load report"))
    })
  }

  override def loadCss(key: String): CssSourcePaths = {
    load(ContextAndSuffix(key, "css"), path => {
      val json = pathToJson(path).getOrElse(throw new IllegalArgumentException(s"Can't load path $path"))
      SourcePaths.css(config.prefix, json).getOrElse(throw new IllegalStateException("Can't load report"))
    })
  }
}

