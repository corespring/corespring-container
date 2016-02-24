package org.corespring.container.client.pages

import org.corespring.container.client.VersionInfo
import org.corespring.container.client.component.ComponentJson
import org.corespring.container.client.controllers.apps.PageSourceService
import org.corespring.container.client.integration.ContainerExecutionContext
import org.corespring.container.client.pages.engine.JadeEngine
import org.corespring.container.client.pages.processing.AssetPathProcessor
import play.api.templates.Html

import scala.concurrent.Future

class PlayerRenderer(
                    containerContext: ContainerExecutionContext,
                    jadeEngine:JadeEngine,
                    pageSourceService: PageSourceService,
                    assetPathProcessor: AssetPathProcessor,
                    componentJson:ComponentJson,
                    versionInfo:VersionInfo
                    ) {


  def render : Future[Html] = Future{

    val params : Map[String,Any] = Map(
      "appName" -> "player"
    )

    jadeEngine.renderJade("player", params)
  }

}
