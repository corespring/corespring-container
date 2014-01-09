package org.corespring.container.client.controllers.hooks

import org.corespring.container.client.actions.{ClientHooksActionBuilder, PlayerRequest}
import org.corespring.container.client.controllers.helpers.LayoutComponentReading
import org.corespring.container.client.views.txt.js.PlayerServices
import org.corespring.container.components.model.Component
import play.api.Logger
import play.api.http.ContentTypes
import play.api.libs.json.JsValue
import play.api.mvc.{AnyContent, Action}


trait PlayerHooks extends BaseHooksWithBuilder[ClientHooksActionBuilder[AnyContent]] with LayoutComponentReading {

  val log = Logger("player.hooks")

  def name = "player"

  override def services(sessionId:String) : Action[AnyContent] = builder.loadServices(sessionId) { request : PlayerRequest[AnyContent] =>
    import org.corespring.container.client.controllers.resources.routes._

    val itemId = request.itemSession.map{ json => (json \ "itemId").as[String]}.getOrElse("?")
    val jsServices = PlayerServices(
      ngModule,
      Session.loadEverything(sessionId),
      Session.submitSession(sessionId),
      Session.saveSession(sessionId),
      Item.getScore(itemId),
      Session.completeSession(sessionId),
      Session.loadOutcome(sessionId)
    )

    Ok(jsServices).as("text/javascript")
  }

  override def componentsJs(sessionId: String): Action[AnyContent] = builder.loadComponents(sessionId) {
    request: PlayerRequest[AnyContent] =>
      log.debug(s"load js for session $sessionId")
      val typesUsed = componentTypes(request.item)
      val usedComponents = getAllComponentsForTags(typesUsed)
      val (libs, uiComps, layoutComps) = splitComponents(usedComponents)
      val uiJs = uiComps.map((c) => wrapJs(c.org, c.name, c.client.render)).mkString("\n")
      val libJs = libs.map(libraryToJs(addClient = true, addServer = false)).mkString("\n")
      val layoutJs = layoutComps.map(layoutToJs).mkString("\n")
      Ok(s"$libJs\n$uiJs\n$layoutJs").as("text/javascript")
  }

  override def componentsCss(sessionId: String):  Action[AnyContent] = builder.loadComponents(sessionId) {
    request =>
      log.debug(s"load css for session $sessionId")
      val typesUsed = componentTypes(request.item)
      def isUsed(c:Component) = typesUsed.exists(t => c.matchesType(t))
      val usedComponents = uiComponents.filter(isUsed)
      val uiCss = usedComponents.map(_.client.css.getOrElse("")).mkString("\n")
      val layoutCompsUsed = layoutComponents.filter(isUsed)
      val layoutCss = layoutCompsUsed.map(_.css.getOrElse("")).mkString("\n")
      Ok(s"$uiCss\n$layoutCss").as(ContentTypes.CSS)
  }

  def createSessionForItem(itemId: String): Action[AnyContent] = builder.createSessionForItem(itemId) {
    request =>
      //TODO: How to get this path accurately - atm will only support one level of nesting of the routes file?
      val PathRegex = s"""/(.*?)/.*/$itemId.*""".r
      val PathRegex(root) = request.path
      val file = request.queryString.get("file").map(_(0)).getOrElse("index.html")
      val url = org.corespring.container.client.controllers.routes.Assets.session(request.sessionId, file).url
      SeeOther(url)
  }

  override protected def componentTypes(json: JsValue): Seq[String] = {

    val interactiveComponents = (json \ "components" \\ "componentType").map(_.as[String]).distinct

    def layoutComponentsInItem: Seq[String] = {
      val out: Seq[String] = (json \ "xhtml").asOpt[String].map { l =>
        layoutTypesInXml(l, layoutComponents)
      }.getOrElse(Seq())
      out
    }

    interactiveComponents ++ layoutComponentsInItem
  }
}
