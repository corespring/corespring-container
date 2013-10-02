package org.corespring.container.controllers

import org.corespring.container.components.model.Component
import org.corespring.container.player.actions.{PlayerRequest, PlayerActionBuilder}
import play.api.libs.json.{JsValue, Json}
import play.api.mvc.{AnyContent, Action, Controller}

trait Main extends Controller {

  def builder: PlayerActionBuilder[AnyContent]

  def components: Seq[Component]

  private val log = play.api.Logger("player.web")

  val playerServices = "player-services.js"
  val namespace = "player-web.services"

  private def testJson(xhtml: String, dependencies: Seq[String], scriptPaths: Seq[String]): String =
    s"""
      |{
      |  "xhtml" : "$xhtml",
      |  "angular" : {
      |    "dependencies" : [ "${dependencies.mkString("\",\"")}" ]
      |  },
      |  "scripts" : [ "${scriptPaths.mkString("\",\"")}" ]
      |}
    """.stripMargin


  def loadConfig(id: String): Action[AnyContent] = builder.playerAction(id) {
    request: PlayerRequest[AnyContent] =>
      log.debug(s"load config: $id")
      log.debug(Json.stringify(request.item))
      val xhtml = processXhtml((request.item \ "xhtml").as[String])
      val components: Seq[String] = componentTypes(request.item)
      val moduleNames = components.map(makeModuleName)
      val out: String = testJson(xhtml, Seq(namespace) ++ moduleNames, Seq(playerServices, "components.js"))
      val jsonOut = Json.parse(out)
      Ok(jsonOut)
  }

  def componentTypes(json: JsValue): Seq[String] = (json \ "components" \\ "componentType").map(_.as[String]).distinct


  def componentJs(id: String): Action[AnyContent] = builder.playerAction(id) {
    request: PlayerRequest[AnyContent] =>

      def wrapJs(c: Component) = {
        import org.corespring.container.views.txt._
        ComponentWrapper(moduleName(c.org, c.name), directiveName(c.org, c.name), c.client.render)
      }
      val typesUsed = componentTypes(request.item)
      val usedComponents = components.filter(c => typesUsed.exists(t => c.matchesType(t)))
      val js = usedComponents.map(c => wrapJs(c)).mkString("\n")
      Ok(js).as("text/javascript")
  }


  private def processXhtml(s: String): String = {
    s.trim
      .replace("\"", "\\\"")
      .replace("\n", "\\n")
      .replace("/", "\\/")
  }

  private def makeModuleName(componentType: String): String = {
    val Regex = """(.*?)-(.*)""".r
    val Regex(org, comp) = componentType
    moduleName(org, comp)
  }

  private def moduleName(org: String, comp: String) = s"$org.$comp"

  private def directiveName(org: String, comp: String) = s"$org${hyphenatedToTitleCase(comp)}"

  private def hyphenatedToTitleCase(s: String): String = s.split("-").map(_.capitalize).mkString("")

  def playerServices(id: String) = builder.playerAction(id) {
    request: PlayerRequest[AnyContent] =>
      log.debug(s"load player services: $id")
      Ok(s"angular.module('$namespace', []).factory('PlayerServices', [function(){ return {} }]);")
  }

}
