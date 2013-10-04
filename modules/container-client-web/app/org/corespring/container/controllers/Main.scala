package org.corespring.container.controllers

import org.corespring.container.components.model.Component
import org.corespring.container.player.actions.{PlayerRequest, PlayerActionBuilder}
import play.api.libs.json.{JsValue, Json}
import play.api.mvc.{AnyContent, Action, Controller}

trait Main extends Controller {

  def builder : PlayerActionBuilder[AnyContent]

  def components: Seq[Component]

  private val log = play.api.Logger("player.web")

  val playerServices = "player-services.js"
  val editorServices = "editor-services.js"
  val playerNamespace = "player-web.services"
  val editorNamespace = "editor-web.services"

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


  def loadConfig(sessionId: String): Action[AnyContent] = builder.playAction(sessionId) {
    request: PlayerRequest[AnyContent] =>
      val xhtml = processXhtml((request.item \ "xhtml").as[String])
      val components: Seq[String] = componentTypes(request.item)
      val moduleNames = components.map(makeModuleName)
      val out: String = testJson(xhtml, Seq(playerNamespace) ++ moduleNames, Seq(playerServices, "components.js"))
      val jsonOut = Json.parse(out)
      Ok(jsonOut)
  }

  // TODO: remove duplication
  def loadEditorConfig(itemId: String): Action[AnyContent] = builder.editorAction(itemId) {
    request: PlayerRequest[AnyContent] =>
      val xhtml = processXhtml((request.item \ "xhtml").as[String])
      val components: Seq[String] = componentTypes(request.item)
      val moduleNames = components.map(makeModuleName)
      val out: String = testJson(xhtml, Seq(editorNamespace) ++ moduleNames, Seq(editorServices, "editor-components.js"))
      val jsonOut = Json.parse(out)
      Ok(jsonOut)
  }

  def componentTypes(json: JsValue): Seq[String] = (json \ "components" \\ "componentType").map(_.as[String]).distinct

  def componentJs(sessionId: String): Action[AnyContent] = builder.playAction(sessionId) {
    request: PlayerRequest[AnyContent] =>
      log.debug(s"load js for session $sessionId")
      val typesUsed = componentTypes(request.item)
      val usedComponents = components.filter(c => typesUsed.exists(t => c.matchesType(t)))
      val js = usedComponents.map(c => wrapJs(c)).mkString("\n")
      Ok(js).as("text/javascript")
  }

  def editorComponentsJs(itemId:String) : Action[AnyContent] = builder.editorAction(itemId) {
    request : PlayerRequest[AnyContent] =>
      val js = components.map(c => wrapJsForEditor(c)).mkString("\n")
      Ok(js).as("text/javascript")
  }

  private def wrapJs(c: Component) =
    org.corespring.container.views.txt.ComponentWrapper(moduleName(c.org, c.name), directiveName(c.org, c.name), c.client.render)

  private def wrapJsForEditor(c: Component) =
    org.corespring.container.views.txt.ComponentWrapper(moduleName(c.org, c.name), directiveName(c.org, c.name), c.client.configure)

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

  def playerServices(sessionId: String) = builder.playAction(sessionId) {
    request: PlayerRequest[AnyContent] =>
      log.debug(s"load player services: $sessionId")
      import org.corespring.container.views.txt._
      import org.corespring.container.controllers.routes._
      Ok(PlayerServices(playerNamespace, Session.loadEverything(sessionId), Session.submitAnswers(sessionId))).as("text/javascript")
  }

  def editorServices(itemId: String) = builder.editorAction(itemId) {
    request: PlayerRequest[AnyContent] =>
      log.debug(s"load editor services: $itemId")
      import org.corespring.container.views.txt._
      import org.corespring.container.controllers.routes._
      Ok(EditorServices(editorNamespace, Item.load(itemId), Item.save(itemId))).as("text/javascript")
  }

}
