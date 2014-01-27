package org.corespring.container.client.controllers.hooks

import org.corespring.container.client.actions.{PlayerHooksActionBuilder, PlayerRequest}
import org.corespring.container.client.controllers.helpers.LayoutComponentReading
import org.corespring.container.client.views.txt.js.PlayerServices
import org.corespring.container.components.model.Component
import play.api.Logger
import play.api.http.ContentTypes
import play.api.libs.json.JsValue
import play.api.mvc._
import scala.concurrent.{Future, Await}
import org.corespring.container.client.actions.PlayerRequest
import play.api.mvc.SimpleResult


trait PlayerHooks extends BaseHooksWithBuilder[PlayerHooksActionBuilder[AnyContent]] with LayoutComponentReading {

  val log = Logger("player.hooks")

  def name = "player"

  override def services(sessionId: String): Action[AnyContent] = builder.loadServices(sessionId) {
    request: PlayerRequest[AnyContent] =>
      import org.corespring.container.client.controllers.resources.routes._

      val itemId = request.itemSession.map {
        json => (json \ "itemId").as[String]
      }.getOrElse("?")
      val jsServices = PlayerServices(
        ngModule,
        Session.loadEverything(sessionId),
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
      jsForComponents(typesUsed)
  }


  override def componentsCss(sessionId: String): Action[AnyContent] = builder.loadComponents(sessionId) {
    request =>
      log.debug(s"load css for session $sessionId")
      val typesUsed = componentTypes(request.item)
      def isUsed(c: Component) = typesUsed.exists(t => c.matchesType(t))
      val usedComponents = uiComponents.filter(isUsed)
      val uiCss = usedComponents.map(_.client.css.getOrElse("")).mkString("\n")
      val layoutCompsUsed = layoutComponents.filter(isUsed)
      val layoutCss = layoutCompsUsed.map(_.css.getOrElse("")).mkString("\n")
      Ok(s"$uiCss\n$layoutCss").as(ContentTypes.CSS)
  }

  def createSessionForItem(itemId: String): Action[AnyContent] = builder.createSessionForItem(itemId) {
    request =>
      val file = request.queryString.get("file").map(_(0)).getOrElse("index.html")
      import org.corespring.container.client.controllers.hooks.routes.{PlayerHooks => Routes}
      val url = s"${Routes.loadPlayerForSession(request.sessionId).url}?file=$file&mode=gather"
      SeeOther(url)
  }

  private def playerPage(request:Request[AnyContent]) = {
    def has(n:String) =  request.path.contains(n) || request.getQueryString("file") == Some(n)
    if(has("container-player.html")) "container-player.html" else "player.html"
  }

  def loadPlayerForSession(sessionId: String) = builder.loadPlayerForSession(sessionId){ (code: Int, msg: String ) =>
    Ok(org.corespring.container.client.views.html.error.main(code, msg))
  } {
    request =>
      val page = playerPage(request)
      import scala.concurrent.duration._
      val f : Future[SimpleResult]= controllers.Assets.at("/container-client", page)(request)
      Await.result( f, 3.seconds)
  }

  override protected def componentTypes(json: JsValue): Seq[String] = {

    val interactiveComponents = (json \ "components" \\ "componentType").map(_.as[String]).distinct

    def layoutComponentsInItem: Seq[String] = {
      val out: Seq[String] = (json \ "xhtml").asOpt[String].map {
        l =>
          layoutTypesInXml(l, layoutComponents)
      }.getOrElse(Seq())
      out
    }

    interactiveComponents ++ layoutComponentsInItem
  }
}
