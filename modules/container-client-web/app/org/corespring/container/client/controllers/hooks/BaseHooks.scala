package org.corespring.container.client.controllers.hooks

import org.corespring.container.client.actions.ClientHooksActionBuilder
import org.corespring.container.client.actions.PlayerRequest
import org.corespring.container.client.views.txt.js.ComponentWrapper
import org.corespring.container.components.model.Component
import play.api.libs.json.{Json, JsValue}
import play.api.mvc.{Result, Controller, Action, AnyContent}

trait BaseHooks extends Controller{

  protected def name : String

  def ngModule = s"$name.services"

  def ngJs = s"$name-services.js"

  def componentCss = s"$name-components.css"

  def componentJs = s"$name-components.js"

  def loadedComponents: Seq[Component]

  def builder : ClientHooksActionBuilder[AnyContent]

  def config(id: String): Action[AnyContent] = builder.loadConfig(id) {
    request: PlayerRequest[AnyContent] =>
      val xhtml = processXhtml((request.item \ "xhtml").as[String])
      val itemComponentTypes: Seq[String] = componentTypes(request.item)
      val moduleNames = itemComponentTypes.map(makeModuleName)
      val out: String = configJson(
         xhtml,
        Seq(ngModule) ++ moduleNames,
        Seq(ngJs, componentJs),
        Seq(componentCss)
      )
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
  def componentsJs(id:String) : Action[AnyContent]

  def resource(resource:String,suffix:String, id:String) : Action[AnyContent] = {
    resource match {
      case ("config") => config(id)
      case("services") => services(id)
      case ("components") => suffix match {
        case ("js") => componentsJs(id)
        case ("css") => componentsCss(id)
      }
      case _ => Action(NotFound(s"$resource, $suffix, $id"))
    }
  }

  /**
   * Load the component css
   * @param id
   * @return
   */
  def componentsCss(id:String) : Action[AnyContent]


   protected def configJson( xhtml: String,
                            dependencies: Seq[String],
                            scriptPaths: Seq[String],
                            cssPaths : Seq[String]): String =
    s"""
      |{
      |  "xhtml" : "$xhtml",
      |  "angular" : {
      |    "dependencies" : [ "${dependencies.mkString("\",\"")}" ]
      |  },
      |  "scripts" : [ "${scriptPaths.mkString("\",\"")}" ],
      |  "css" : [ "${cssPaths.mkString("\",\"")}"]
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

  protected def componentsToResource(components: Seq[Component], componentToString : Component => String, contentType : String) : Result = {
    Ok(components.map(componentToString).mkString("\n")).as(contentType)
  }


  protected def wrapJs(org: String, name: String, src: String, directive : Option[String] = None) = ComponentWrapper(moduleName(org, name), directiveName(org, name), src).toString

  protected def moduleName(org: String, comp: String) = s"$org.$comp"

  protected def directiveName(org: String, comp: String) = s"$org${hyphenatedToTitleCase(comp)}"

  private def hyphenatedToTitleCase(s: String): String = s.split("-").map(_.capitalize).mkString("")
}
