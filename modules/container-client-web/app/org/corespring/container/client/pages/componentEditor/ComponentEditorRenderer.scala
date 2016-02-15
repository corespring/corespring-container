package org.corespring.container.client.pages.componentEditor

import org.corespring.container.client.controllers.apps.{ ComponentInfoJson, ComponentScriptBundle, PageSourceService }
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages.engine.JadeEngine
import org.corespring.container.client.views.txt.js.ComponentEditorServices
import org.corespring.container.components.model.{ Component, Widget, Interaction }
import play.api.Logger
import play.api.libs.json.{ JsArray, JsValue }
import play.api.templates.Html

import scala.concurrent.Future

trait ComponentService {
  def interactions: Seq[Interaction]
  def widgets: Seq[Widget]
}

trait ComponentJson {
  def toJson(c: Component): JsValue
}

class ComponentEditorRenderer(
  containerExecutionContext: ContainerExecutionContext,
  jade: JadeEngine,
  pageSourceService: PageSourceService,
  componentService: ComponentService,
  componentJson: ComponentJson) extends ComponentInfoJson {

  private val logger = Logger(classOf[ComponentEditorRenderer])

  private val name = "singleComponentEditor"

  implicit def ec = containerExecutionContext.context

  private object sources {
    lazy val js = {
      pageSourceService.loadJs(name)
    }

    lazy val css = {
      pageSourceService.loadCss(name)
    }
  }

  def render(componentBundle: ComponentScriptBundle, prodMode: Boolean = false): Future[Html] = Future {

    val css = if (prodMode) Seq(sources.css.dest) else sources.css.src
    val js = if (prodMode) Seq(sources.js.dest) else sources.js.src
    val arr: JsArray = JsArray(componentService.interactions.map(componentJson.toJson(_)))
    val inlineJs = ComponentEditorServices(s"corespring-$name.services", arr, componentBundle.componentType).toString

    val params: Map[String, Any] = Map(
      "appName" -> name,
      "css" -> (css ++ componentBundle.css).toArray,
      "js" -> (sources.js.otherLibs ++ js ++ componentBundle.js).toArray,
      "ngModules" -> (sources.js.ngModules ++ componentBundle.ngModules).map(s => s"'$s'").mkString(","),
      "ngServiceLogic" -> inlineJs,
      "componentNgModules" -> "",
      "options" -> "{}",
      "versionInfo" -> "{}")

    logger.info(s"function=render, params=$params")

    jade.renderJade("singleComponentEditor", params)
  }
}
