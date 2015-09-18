package org.corespring.shell

import com.amazonaws.services.s3.AmazonS3
import com.mongodb.casbah.{ MongoCollection, MongoDB, MongoClientURI, MongoClient }
import org.corespring.container.client.filters.ComponentSetsFilter
import org.corespring.container.components.loader.FileComponentLoader
import org.corespring.mongo.json.services.MongoService
import org.corespring.play.utils.{ CallBlockOnHeaderFilter, ControllerInstanceResolver }
import org.corespring.shell.controllers.{ Launchers, Main }
import org.corespring.shell.filters.AccessControlFilter
import org.corespring.shell.services.ItemDraftService
import play.api.mvc._
import org.corespring.container.logging.ContainerLogger
import play.api.{ Mode, GlobalSettings, Play }

import scala.concurrent.ExecutionContext

object Global extends WithFilters(AccessControlFilter, CallBlockOnHeaderFilter) with ControllerInstanceResolver with GlobalSettings {

  lazy val componentSetFilter = new ComponentSetsFilter {
    override implicit def ec: ExecutionContext = ExecutionContext.global

    override lazy val bucket: String = Play.current.configuration.getString("amazon.s3.bucket").getOrElse("bucket")

    override def appVersion: String = (containerClient.versionInfo \ "commitHash").as[String]

    override def s3: AmazonS3 = containerClient.s3Client

    override lazy val enabled: Boolean = Play.current.configuration.getBoolean("components.filter.enabled").getOrElse(false)
  }

  override def doFilter(a: EssentialAction): EssentialAction = {
    Filters(super.doFilter(a), Seq(componentSetFilter): _*)
  }

  private lazy val logger = ContainerLogger.getLogger("Global")

  lazy val controllers: Seq[Controller] = containerClient.controllers ++ Seq(home, launchers)

  private lazy val mongoUri = {
    val uri = Play.current.configuration.getString("mongo.db").getOrElse("mongodb://localhost:27017/corespring-container")
    logger.debug(s"uri: $uri")
    MongoClientURI(uri)
  }

  private lazy val mongoClient = MongoClient(mongoUri)

  private lazy val db: MongoDB = {
    logger.debug(s"u: ${mongoUri.username}, p: ${mongoUri.password}")
    mongoClient(mongoUri.database.getOrElse("corespring-container-devt"))
  }

  private lazy val containerClient = new ContainerClientImplementation(
    new MongoService(db("items")),
    new MongoService(db("sessions")),
    new ItemDraftService(db("itemDrafts")),
    componentLoader.all,
    Play.current.configuration)

  private lazy val launchers = new Launchers {}

  private lazy val home = new Main {
    override def sessionService: MongoService = new MongoService(db("sessions"))
    override def items: MongoCollection = db("items")
    override def itemDrafts = new ItemDraftService(db("itemDrafts"))
  }

  override def onStart(app: play.api.Application): Unit = {
    logger.trace("trace")
    logger.debug("debug")
    logger.info("info")
    logger.warn("warn")
    logger.error("error")

    containerClient.validate match {
      case Left(err) => throw new RuntimeException(err)
      case Right(_) => Unit
    }

    CallBlockOnHeaderFilter.block = (rh: RequestHeader) => {
      if ((rh.path.contains(".html") || rh.path.endsWith("player")) && componentLoader != null) {
        logger.info("-------------------------> reload components!")
        componentLoader.reload
      }
    }
  }

  private lazy val componentLoader = {
    val showNonReleasedComponents = Play.current.configuration.getBoolean("components.showNonReleasedComponents").getOrElse(Play.current.mode == Mode.Dev)
    val out = new FileComponentLoader(Play.current.configuration.getString("components.path").toSeq, showNonReleasedComponents)
    out.reload

    if (out.all.length == 0) {
      throw new RuntimeException("Can't load any components - check the path!")
    }

    out
  }

}
