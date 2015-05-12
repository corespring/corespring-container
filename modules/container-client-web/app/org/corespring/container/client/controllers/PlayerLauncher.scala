package org.corespring.container.client.controllers

import java.io.{ File, InputStream }

import org.apache.commons.io.IOUtils
import org.corespring.container.client.V2PlayerConfig
import org.corespring.container.client.hooks.{ PlayerJs, PlayerLauncherHooks }
import org.corespring.container.client.views.txt.js.ServerLibraryWrapper
import org.corespring.container.logging.ContainerLogger
import play.api.Play
import play.api.http.ContentTypes
import play.api.libs.json.Json.JsValueWrapper
import play.api.libs.json.{ JsString, JsObject, Json }
import play.api.mvc.Session
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

  object LaunchOptions {

    import org.corespring.container.client.controllers.resources.routes.ItemDraft

    val catalog = Json.obj(
      "paths" -> Json.obj(
        "catalog" -> Catalog.load(":itemId")))

    val editor = {
      Json.obj(
        "paths" -> Json.obj(
          "editor" -> Editor.load(":draftId"),
          "devEditor" -> DevEditor.load(":draftId"),
          "createItemAndDraft" -> ItemDraft.createItemAndDraft(),
          "commitDraft" -> ItemDraft.commit(":draftId")))
    }

    val player = {
      val loadSession = Player.load(":sessionId")
      Json.obj(
        "mode" -> "gather",
        "paths" -> Json.obj(
          "createSession" -> Player.createSessionForItem(":id"),
          "gather" -> loadSession,
          "view" -> loadSession,
          "evaluate" -> loadSession))
    }
  }

  object Definitions {
    def player(isSecure: Boolean) = s"org.corespring.players.ItemPlayer = corespring.require('player').define($isSecure);"
    val editor = "org.corespring.players.ItemEditor = corespring.require('editor');"
    val catalog = "org.corespring.players.ItemCatalog = corespring.require('catalog');"
  }

  def editorJs = Action.async { implicit request =>
    hooks.editorJs.map { implicit js =>
      make(editorNameAndSrc, LaunchOptions.editor, Definitions.editor)
    }
  }

  def catalogJs = Action.async { implicit request =>
    hooks.catalogJs.map { implicit js =>
      make(catalogNameAndSrc, LaunchOptions.catalog, Definitions.catalog)
    }
  }

  def playerJs = Action.async { implicit request =>
    hooks.playerJs.map { implicit js =>
      logger.debug(s"playerJs - isSecure=${js.isSecure}, path=${request.path}, queryString=${request.rawQueryString}")
      make(playerNameAndSrc, LaunchOptions.player, Definitions.player(js.isSecure))
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

  val SecureMode = "corespring.player.secure"

  private def sumSession(s: Session, keyValues: (String, String)*): Session = {
    keyValues.foldRight(s)((kv: (String, String), acc: Session) => acc + (kv._1, kv._2))
  }

  private def make(additionalJsNameAndSrc: (String, String), options: JsObject, bootstrapLine: String)(implicit request: Request[AnyContent], js: PlayerJs): SimpleResult = {
    val corespringUrl = playerConfig.rootUrl.getOrElse(BaseUrl(request))
    val builder = new JsBuilder(corespringUrl)
    val finalSession = sumSession(js.session, (SecureMode, js.isSecure.toString))

    Ok(builder.build(additionalJsNameAndSrc, options, bootstrapLine)(request, js))
      .as(ContentTypes.JAVASCRIPT)
      .withSession(finalSession)
  }
}

class JsBuilder(corespringUrl: String) {

  lazy val coreJs: String = {
    val corePaths = Seq(
      "container-client/bower_components/msgr.js/dist/msgr.js",
      "container-client/js/player-launcher/logger.js",
      "container-client/js/player-launcher/error-codes.js",
      "container-client/js/player-launcher/instance.js",
      "container-client/js/player-launcher/client-launcher.js",
      "container-client/js/player-launcher/url-builder.js",
      "container-client/js/player-launcher/object-id.js")
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

  private def queryStringToJson(implicit rh: RequestHeader) = JsObject(rh.queryString.mapValues { v => JsString(v.mkString) }.toSeq)

  def build(additionalJsNameAndSrc: (String, String), options: JsObject, bootstrapLine: String)(implicit request: Request[AnyContent], js: PlayerJs): String = {
    val fullConfig = Json.obj(
      "corespringUrl" -> corespringUrl,
      "queryParams" -> queryStringToJson,
      "errors" -> js.errors,
      "warnings" -> js.warnings) ++ options
    val fullConfigJs = ("launch-config" -> s"module.exports = ${Json.stringify(fullConfig)}")
    val wrappedNameAndContents = Seq(fullConfigJs, additionalJsNameAndSrc)
    val wrappedContents = wrappedNameAndContents.map(tuple => ServerLibraryWrapper(tuple._1, tuple._2))

    def sumSession(s: Session, keyValues: (String, String)*): Session = {
      keyValues.foldRight(s)((kv: (String, String), acc: Session) => acc + (kv._1, kv._2))
    }

    s"""
       $coreJs
       ${wrappedContents.mkString("\n")}
       $bootstrapLine"""
  }
}
