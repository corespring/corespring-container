package org.corespring.shell

import com.mongodb.casbah.{ MongoClient, MongoClientURI, MongoCollection, MongoDB }
import org.corespring.container.components.loader.FileComponentLoader
import org.corespring.container.components.model.Interaction
import org.corespring.container.logging.ContainerLogger
import org.corespring.mongo.json.services.MongoService
import org.corespring.play.utils.{ CallBlockOnHeaderFilter, ControllerInstanceResolver }
import org.corespring.shell.controllers.{ Launchers, Main }
import org.corespring.shell.filters.AccessControlFilter
import org.corespring.shell.services.{ ItemService, SessionService, ItemDraftService }
import play.api.mvc._
import play.api.{ GlobalSettings, Mode, Play }

object Global extends WithFilters(AccessControlFilter, CallBlockOnHeaderFilter) with ControllerInstanceResolver with GlobalSettings {

  private lazy val logger = ContainerLogger.getLogger("Global")

  lazy val controllers: Seq[Controller] = containerClient.defaultIntegrationControllers ++ Seq(home, launchers)

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
    new ItemService(db("items")),
    new SessionService(db("sessions")),
    new ItemDraftService(db("itemDrafts")),
    componentLoader.all,
    Play.current.configuration)

  private lazy val launchers = new Launchers(
    interactions = componentLoader.all.flatMap {
      case i: Interaction => Some(i)
      case _ => None
    })

  private lazy val home = new Main(
    sessionService = new SessionService(db("sessions")),
    items = db("items"),
    itemDrafts = new ItemDraftService(db("itemDrafts")))

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
    val out = new FileComponentLoader(Play.current.configuration.getString("components.path").toSeq)
    out.reload
    if (out.all.length == 0) {
      throw new RuntimeException("Can't load any components - check the path!")
    }
    out
  }

}
