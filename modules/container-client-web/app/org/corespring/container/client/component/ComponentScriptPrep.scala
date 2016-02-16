package org.corespring.container.client.component

import grizzled.slf4j.Logger
import org.corespring.container.client.controllers.angular.AngularModules
import org.corespring.container.client.controllers.apps._
import org.corespring.container.client.controllers.helpers.LoadClientSideDependencies
import org.corespring.container.client.pages.processing.AssetPathProcessor
import org.corespring.container.components.model.Id
import org.corespring.container.components.model.dependencies.DependencyResolver
import play.api.Mode._
import play.api.mvc.RequestHeader

trait ComponentScriptPrep extends DependencyResolver
  with LoadClientSideDependencies {
  def ngModules(context: String): AngularModules = new AngularModules(s"$context.services")

  private lazy val logger = Logger(classOf[ComponentScriptPrep])

  private val typeRegex = "(.*?)-(.*)".r
  def urls: ComponentUrls

  def mode: Mode

  protected def jsMode(implicit r: RequestHeader): String = {
    r.getQueryString("mode").getOrElse(mode.toString.toLowerCase)
  }

  protected def paths(d: SourcePaths)(implicit r: RequestHeader) = jsMode match {
    case "prod" => Seq(d.dest)
    case "dev" => d.src
    case _ => {
      logger.warn(s"Unknown mode $jsMode - falling back to prod")
      Seq(d.dest)
    }
  }

  def modulePath = v2Player.Routes.prefix

  /** Allow external domains to be configured */
  def resolveDomain(path: String): String = path

  def assetPathProcessor: AssetPathProcessor

  /**
   * A temporary means of defining paths that may be resolved
   */
  protected def resolvePath(s: String): String = assetPathProcessor.process(s)

  def pageSourceService: PageSourceService
  def jsSrc(context: String): NgSourcePaths = pageSourceService.loadJs(context)
  def cssSrc(context: String): CssSourcePaths = pageSourceService.loadCss(context)

  protected def buildJs(scriptInfo: ComponentScriptInfo,
    extras: Seq[String] = Seq.empty)(implicit rh: RequestHeader) = {
    val jsSourcePaths = jsSrc(scriptInfo.context)
    val mainJs = paths(jsSourcePaths)
    val js = jsSourcePaths.otherLibs ++ mainJs ++ scriptInfo.jsUrl ++ extras
    js.distinct.map(resolvePath)
  }

  protected def buildCss(scriptInfo: ComponentScriptInfo)(implicit rh: RequestHeader) = {
    val cssSourcePaths = cssSrc(scriptInfo.context)
    val out = paths(cssSourcePaths) ++ cssSourcePaths.otherLibs ++ scriptInfo.cssUrl
    out.map(resolvePath)
  }

  protected def componentScriptInfo(context: String, components: Seq[String], separatePaths: Boolean, reportName: Option[String] = None): ComponentScriptInfo = {

    val typeIds = components.map {
      t =>
        val typeRegex(org, name) = t
        new Id(org, name)
    }

    logger.trace(s"function=componentScriptInfo typeIds=$typeIds")
    val resolvedComponents = resolveComponents(typeIds, Some(context))
    val jsUrl = urls.jsUrl(context, resolvedComponents, separatePaths)
    val cssUrl = urls.cssUrl(context, resolvedComponents, separatePaths)
    val clientSideDependencies = getClientSideDependencies(resolvedComponents)
    val dependencies = ngModules(context).createAngularModules(resolvedComponents, clientSideDependencies)
    ComponentScriptInfo(context, jsUrl, cssUrl, dependencies)
  }
}
