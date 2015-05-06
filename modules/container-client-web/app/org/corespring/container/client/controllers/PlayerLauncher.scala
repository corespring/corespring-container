package org.corespring.container.client.controllers

import java.io.{ File, InputStream }

import org.apache.commons.io.IOUtils
import org.apache.commons.lang3.StringEscapeUtils
import org.corespring.container.client.V2PlayerConfig
import org.corespring.container.client.hooks.{ PlayerJs, PlayerLauncherHooks }
import org.corespring.container.client.views.txt.js.ServerLibraryWrapper
import org.corespring.container.logging.ContainerLogger
import play.api.Play
import play.api.http.ContentTypes
import play.api.libs.json.Json.JsValueWrapper
import play.api.libs.json.{ JsValue, Json }
import play.api.mvc._

import scala.concurrent.ExecutionContext

trait PlayerLauncher extends Controller {

  def playerConfig: V2PlayerConfig

  implicit def ec: ExecutionContext

  lazy val logger = ContainerLogger.getLogger("PlayerLauncher")

  //TODO: This is lifted from corespring-api -> move to a library
  object BaseUrl {
    def apply(r: RequestHeader): String = {

      /**
       * Note: You can't check a request to see if its http or not in Play
       * But even if you could you may be sitting behind a reverse proxy.
       * see: https://groups.google.com/forum/?fromgroups=#!searchin/play-framework/https$20request/play-framework/11zbMtNI3A8/o4318Z-Ir6UJ
       * but the tip was to check for the header below
       */
      val protocol = r.headers.get("x-forwarded-proto") match {
        case Some("https") => "https"
        case _ => "http"
      }

      protocol + "://" + r.host
    }
  }

  import org.corespring.container.client.controllers.apps.routes.{ Editor, DevEditor, Player, Catalog }

  val SecureMode = "corespring.player.secure"

  def hooks: PlayerLauncherHooks

  lazy val editorNameAndSrc = {
    val jsPath = "container-client/js/player-launcher/editor.js"
    pathToNameAndContents(jsPath)
  }

  lazy val catalogNameAndSrc = {
    val jsPath = "container-client/js/player-launcher/catalog.js"
    pathToNameAndContents(jsPath)
  }

  lazy val playerNameAndSrc = {
    val jsPath = "container-client/js/player-launcher/player.js"
    pathToNameAndContents(jsPath)
  }

  implicit def callToJson(c: Call): JsValueWrapper = Json.obj("method" -> c.method, "url" -> c.url)

  def editorJs = getEditorJs(Editor.load(":draftId"), DevEditor.load(":draftId"))

  def getEditorJs(editor: Call, devEditor:Call) = Action.async { implicit request =>
    hooks.editorJs.map { implicit js =>

      val rootUrl = playerConfig.rootUrl.getOrElse(BaseUrl(request))

      import org.corespring.container.client.controllers.resources.routes.ItemDraft

      val commitDraft = ItemDraft.commit(":draftId")
      val createItemAndDraft = ItemDraft.createItemAndDraft()

      val defaultOptions: JsValue = Json.obj(
        "corespringUrl" -> rootUrl,
        "paths" -> Json.obj(
          "editor" -> editor,
          "devEditor" -> devEditor,
          "createItemAndDraft" -> createItemAndDraft,
          "commitDraft" -> commitDraft))

      val bootstrap = "org.corespring.players.ItemEditor = corespring.require('editor');"
      make(editorNameAndSrc, defaultOptions, bootstrap)
    }
  }

  def catalogJs = Action.async { implicit request =>
    hooks.catalogJs.map { implicit js =>
      val loadCatalogCall = Catalog.load(":itemId")
      val rootUrl = playerConfig.rootUrl.getOrElse(BaseUrl(request))

      val defaultOptions: JsValue = Json.obj(
        "corespringUrl" -> rootUrl,
        "paths" -> Json.obj(
          "catalog" -> loadCatalogCall))

      val bootstrap = "org.corespring.players.ItemCatalog = corespring.require('catalog');"
      make(catalogNameAndSrc, defaultOptions, bootstrap)
    }
  }

  object defaultOptions {

    def player(request: RequestHeader) = {
      val corespringUrl: String = playerConfig.rootUrl.getOrElse(BaseUrl(request))
      val sessionIdPlayerUrl = Player.load(":sessionId").url
      Json.obj(
        "corespringUrl" -> corespringUrl,
        "mode" -> "gather",
        "paths" -> Json.obj(
          "sessionUrl" -> Player.createSession(":id").url,
          "gather" -> sessionIdPlayerUrl,
          "view" -> sessionIdPlayerUrl,
          "evaluate" -> sessionIdPlayerUrl))
    }

  }

  /**
   * query: playerPage the player page to load (default: index.html), for a simple player you can pass in container-player.html
   */
  def playerJs = Action.async { implicit request =>
    hooks.playerJs.map { implicit js =>
      logger.debug(s"playerJs - isSecure=${js.isSecure}, path=${request.path}, queryString=${request.rawQueryString}")

      val bootstrap = s"org.corespring.players.ItemPlayer = corespring.require('player').define(${js.isSecure});"
      make(playerNameAndSrc, defaultOptions.player(request), bootstrap)
    }
  }

  /**
   * Read a js resource from the classpath
   * @param p
   * @return name (without suffix) -> source
   */
  private def pathToNameAndContents(p: String): (String, String) = {
    import grizzled.file.GrizzledFile._
    import Play.current
    Play.resource(p).map {
      r =>
        val name = new File(r.getFile).basename.getName.replace(".js", "")

        val input = r.getContent().asInstanceOf[InputStream]
        try {
          val contents = IOUtils.toString(input)
          input.close()
          (name, contents)
        } catch {
          case e: Throwable => throw new RuntimeException("Error converting input to string", e)
        } finally {
          IOUtils.closeQuietly(input)
        }
    }.getOrElse {
      throw new RuntimeException(s"Can't find resource for path: $p")
    }
  }

  lazy val coreJs: String = {
    val corePaths = Seq(
      "container-client/bower_components/msgr.js/dist/msgr.js",
      "container-client/js/player-launcher/logger.js",
      "container-client/js/player-launcher/errors.js",
      "container-client/js/player-launcher/instance.js",
      "container-client/js/player-launcher/url-builder.js")
    val rawJs = pathToNameAndContents("container-client/js/corespring/core-library.js")._2
    val wrapped = corePaths.map(pathToNameAndContents).map(t => ServerLibraryWrapper(t._1, t._2))
    val bootstrap =
      s"""
        |window.org = window.org || {};
        |org.corespring = org.corespring || {};
        |org.corespring.players = org.corespring.players || {};
      """.stripMargin
    s"""$bootstrap
        $rawJs
        ${wrapped.mkString("\n")}
      """
  }

  private def make(additionalJsNameAndSrc: (String, String), options: JsValue, bootstrapLine: String)(implicit request: Request[AnyContent], js: PlayerJs): SimpleResult = {
    val defaultOptions = ("default-options" -> s"module.exports = ${Json.stringify(options)}")
    val launchErrors = ("launcher-errors" -> errorsToModule(js.errors))
    val launchWarnings = ("launcher-warnings" -> warningsToModule(js.warnings))
    val queryParams = ("query-params" -> makeQueryParams(request.queryString))
    val wrappedNameAndContents = Seq(additionalJsNameAndSrc, defaultOptions, launchErrors, launchWarnings, queryParams)
    val wrappedContents = wrappedNameAndContents.map(tuple => ServerLibraryWrapper(tuple._1, tuple._2))
    def sumSession(s: Session, keyValues: (String, String)*): Session = {
      keyValues.foldRight(s)((kv: (String, String), acc: Session) => acc + (kv._1, kv._2))
    }

    val finalSession = sumSession(js.session, (SecureMode, js.isSecure.toString))

    Ok(
      s"""
       $coreJs
       ${wrappedContents.mkString("\n")}
       $bootstrapLine""")
      .as(ContentTypes.JAVASCRIPT)
      .withSession(finalSession)
  }

  private def makeQueryParams(qp: Map[String, Seq[String]]): String = {
    val js = qp.foldRight[String]("") { (m: (String, Seq[String]), acc: String) =>
      acc ++ s"\nexports.${m._1} = '${m._2.head}';"
    }
    js
  }

  private def errorsToModule(errors: Seq[String]): String = msgToModule(errors, "errors")

  private def warningsToModule(warnings: Seq[String]): String = msgToModule(warnings, "warnings")

  private def msgToModule(msgs: Seq[String], msgType: String): String = {
    val cleaned = msgs.map(StringEscapeUtils.escapeEcmaScript)

    s"""
     |exports.has${msgType.capitalize} = function(){
     |  return exports.$msgType.length > 0;
     |}
     |
     |exports.$msgType = ${if (msgs.length == 0) "[];" else s"['${cleaned.mkString("','")}'];"}
     """.stripMargin
  }
}
