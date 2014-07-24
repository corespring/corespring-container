package org.corespring.shell

import java.io.File

import org.slf4j.LoggerFactory

import scala.concurrent.{ ExecutionContext, Future }

import com.typesafe.config.ConfigFactory
import org.corespring.amazon.s3.ConcreteS3Service
import org.corespring.container.client.CompressedAndMinifiedComponentSets
import org.corespring.container.client.controllers._
import org.corespring.container.client.hooks._
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.client.integration.DefaultIntegration
import org.corespring.container.components.model.Component
import org.corespring.container.components.model.dependencies.DependencyResolver
import org.corespring.mongo.json.services.MongoService
import org.corespring.shell.controllers.ShellDataQueryHooks
import org.corespring.shell.controllers.catalog.actions.{ CatalogHooks => ShellCatalogHooks }
import org.corespring.shell.controllers.editor.{ ItemHooks => ShellItemHooks }
import org.corespring.shell.controllers.editor.actions.{ EditorHooks => ShellEditorHooks }
import org.corespring.shell.controllers.player.{ SessionHooks => ShellSessionHooks }
import org.corespring.shell.controllers.player.actions.{ PlayerHooks => ShellPlayerHooks }
import play.api.{ Configuration, Mode, Play }
import play.api.mvc._

class ContainerClientImplementation(
  val itemService: MongoService,
  val sessionService: MongoService,
  componentsIn: => Seq[Component],
  val configuration: Configuration) extends DefaultIntegration {

  lazy val logger = LoggerFactory.getLogger("container.shell.ContainerClientImplementation")

  override def components: Seq[Component] = componentsIn

  override implicit def ec: ExecutionContext = ExecutionContext.Implicits.global

  override def playerLauncherHooks: PlayerLauncherHooks = new PlayerLauncherHooks {

    val loader = new LoadJs {}

    /**
     * Provides a few hooks so that you can simulate scenarios when loading player:
     * ?secure - a secure request
     * ?jsErrors  - throw errors when loading the player js
     * ?pageErrors - throw errors when loading the player page
     * @return
     */

    override def playerJs(implicit header: RequestHeader): Future[PlayerJs] = loader.loadJs(header)

    override def editorJs(implicit header: RequestHeader): Future[PlayerJs] = loader.loadJs(header)

  }

  lazy val assets = new Assets {

    private lazy val key = configuration.getString("amazon.s3.key")
    private lazy val secret = configuration.getString("amazon.s3.secret")
    private lazy val bucket = configuration.getString("amazon.s3.bucket").getOrElse(throw new RuntimeException("No bucket specified"))

    lazy val playS3 = {
      val out = for {
        k <- key
        s <- secret
      } yield {
        new ConcreteS3Service(k, s)
      }
      out.getOrElse(throw new RuntimeException("No amazon key/secret"))
    }

    override def loadAsset(id: String, file: String)(request: Request[AnyContent]): SimpleResult = {
      playS3.download(bucket, s"$id/$file", Some(request.headers))
    }

    override def getItemId(sessionId: String): Option[String] = ContainerClientImplementation.this.sessionService.load(sessionId).map {
      json => (json \ "itemId").as[String]
    }

    override def hooks: AssetHooks = new AssetHooks {

      override def delete(itemId: String, file: String)(implicit header: RequestHeader): Future[Option[StatusMessage]] = Future {
        val response = playS3.delete(bucket, s"$itemId/$file")
        if (response.success) {
          None
        } else {
          Some(BAD_REQUEST -> s"${response.key}: ${response.msg}")
        }
      }

      override def uploadAction(itemId: String, file: String)(block: (Request[Int]) => SimpleResult): Action[Int] = Action(playS3.upload(bucket, s"$itemId/$file")) { r =>
        block(r)
      }
    }

    override implicit def ec: ExecutionContext = ContainerClientImplementation.this.ec
  }

  lazy val componentSets = new CompressedAndMinifiedComponentSets {

    import play.api.Play.current

    override def allComponents: Seq[Component] = ContainerClientImplementation.this.components

    override def configuration = ContainerClientImplementation.this.configuration.getConfig("components")
      .getOrElse {
        val c = ConfigFactory.parseString(
          s"""
             |minify: ${Play.mode == Mode.Prod}
             |gzip: ${Play.mode == Mode.Prod}
           """.stripMargin)

        new Configuration(c)
      }

    override def dependencyResolver: DependencyResolver = new DependencyResolver {
      override def components: Seq[Component] = allComponents
    }

    override def resource(path: String): Option[String] = Play.resource(s"container-client/bower_components/$path").map { url =>
      logger.trace(s"load resource $path")
      scala.io.Source.fromInputStream(url.openStream())(scala.io.Codec.UTF8).getLines().mkString("\n")
    }

    override def loadLibrarySource(path: String): Option[String] = {
      val componentsPath = configuration.getString("path").getOrElse("?")
      val fullPath = s"$componentsPath/$path"
      val file = new File(fullPath)

      if (file.exists()) {
        logger.trace(s"load file: $path")
        Some(scala.io.Source.fromFile(file)(scala.io.Codec.UTF8).getLines().mkString("\n"))
      } else {
        Some(s"console.warn('failed to log $fullPath');")
      }
    }
  }

  override def editorHooks: EditorHooks = new ShellEditorHooks {
    override def itemService: MongoService = ContainerClientImplementation.this.itemService
  }

  override def catalogHooks: CatalogHooks = new ShellCatalogHooks {
    override def itemService: MongoService = ContainerClientImplementation.this.itemService
  }

  override def sessionHooks: SessionHooks = new ShellSessionHooks {
    override def itemService: MongoService = ContainerClientImplementation.this.itemService

    override def sessionService: MongoService = ContainerClientImplementation.this.sessionService

    override implicit def ec: ExecutionContext = ContainerClientImplementation.this.ec
  }

  override def itemHooks: ItemHooks = new ShellItemHooks {
    override def itemService: MongoService = ContainerClientImplementation.this.itemService

  }

  override def playerHooks: PlayerHooks = new ShellPlayerHooks {
    override def sessionService: MongoService = ContainerClientImplementation.this.sessionService

    override def itemService: MongoService = ContainerClientImplementation.this.itemService

    override implicit def ec: ExecutionContext = ContainerClientImplementation.this.ec
  }

  override def dataQueryHooks: DataQueryHooks = new ShellDataQueryHooks {
    override implicit def ec: ExecutionContext = ContainerClientImplementation.this.ec
  }

}

/**
 * A simple shell utility to allow a tester to simulate page and/or js errors when launching the player js
 */
trait LoadJs {

  import scala.concurrent.ExecutionContext.Implicits.global

  //Implemented as trait so it can be tested without setup
  def loadJs(implicit header: RequestHeader): Future[PlayerJs] = Future {
    def isSecure = header.getQueryString("secure").exists(_ == "true")
    def errors = header.getQueryString("jsErrors").map {
      s => s.split(",").toSeq
    }.getOrElse(Seq())

    val updatedSession = header.getQueryString("pageErrors").map {
      s =>
        header.session + (SessionKeys.failLoadPlayer -> s)
    }.getOrElse {
      header.session - SessionKeys.failLoadPlayer
    }

    PlayerJs(isSecure, updatedSession, errors)
  }
}

