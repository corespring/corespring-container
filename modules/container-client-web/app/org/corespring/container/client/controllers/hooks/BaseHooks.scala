package org.corespring.container.client.controllers.hooks

import org.corespring.container.client.actions.ClientHooksActionBuilder
import org.corespring.container.client.actions.PlayerRequest
import org.corespring.container.client.views.txt.js.ComponentWrapper
import org.corespring.container.components.model.Component
import play.api.libs.json.{Json, JsValue}
import play.api.mvc.{Controller, Action, AnyContent}

trait BaseHooks extends Controller{

  trait AssetNames{
    def namespace : String
    def services  : String
    def components : String
  }

  def names : AssetNames

  def loadedComponents: Seq[Component]

  def builder : ClientHooksActionBuilder[AnyContent]

  def config(id: String): Action[AnyContent] = builder.loadConfig(id) {
    request: PlayerRequest[AnyContent] =>
      val xhtml = processXhtml((request.item \ "xhtml").as[String])
      val itemComponentTypes: Seq[String] = componentTypes(request.item)
      val moduleNames = itemComponentTypes.map(makeModuleName)
      val out: String = configJson(xhtml, Seq(names.namespace) ++ moduleNames, Seq(names.services, names.components))
      val jsonOut = Json.parse(out)
      Ok(jsonOut)
  }

  /**
   * Load the angular service js implemenation
   * @param id
   * @return
   */
  def services(id:String) : Action[AnyContent]

  /**
   * Load the components js
   * @param id
   * @return
   */
  def components(id:String) : Action[AnyContent]

   protected def configJson(xhtml: String, dependencies: Seq[String], scriptPaths: Seq[String]): String =
    s"""
      |{
      |  "xhtml" : "$xhtml",
      |  "angular" : {
      |    "dependencies" : [ "${dependencies.mkString("\",\"")}" ]
      |  },
      |  "scripts" : [ "${scriptPaths.mkString("\",\"")}" ]
      |}
    """.stripMargin

  protected def processXhtml(s: String): String = {
    s.trim
      .replace("\"", "\\\"")
      .replace("\n", "\\n")
      .replace("/", "\\/")
  }

  protected def componentTypes(json: JsValue): Seq[String] = (json \ "components" \\ "componentType").map(_.as[String]).distinct

  protected def makeModuleName(componentType: String): String = {
    val Regex = """(.*?)-(.*)""".r
    val Regex(org, comp) = componentType
    moduleName(org, comp)
  }

  protected def wrapJs(c: Component) =  ComponentWrapper(moduleName(c.org, c.name), directiveName(c.org, c.name), c.client.render)

  protected def moduleName(org: String, comp: String) = s"$org.$comp"

  protected def directiveName(org: String, comp: String) = s"$org${hyphenatedToTitleCase(comp)}"

  private def hyphenatedToTitleCase(s: String): String = s.split("-").map(_.capitalize).mkString("")
}
