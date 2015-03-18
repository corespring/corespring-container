package org.corespring.shell

import com.mongodb.casbah.{ MongoDB, MongoClientURI, MongoClient }
import org.corespring.container.client.hooks.ItemDraftHooks
import org.corespring.container.components.loader.FileComponentLoader
import org.corespring.mongo.json.services.MongoService
import org.corespring.play.utils.{ CallBlockOnHeaderFilter, ControllerInstanceResolver }
import org.corespring.shell.controllers.Main
import org.corespring.shell.filters.AccessControlFilter
import play.api.mvc.{ RequestHeader, WithFilters, Controller }
import org.corespring.container.logging.ContainerLogger
import play.api.{ Mode, GlobalSettings, Play }

object Global extends WithFilters(AccessControlFilter, CallBlockOnHeaderFilter) with ControllerInstanceResolver with GlobalSettings {

  private lazy val logger = ContainerLogger.getLogger("Global")

  lazy val controllers: Seq[Controller] = containerClient.controllers :+ home

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
    componentLoader.all,
    Play.current.configuration)

  private lazy val home = new Main {
    def itemHooks: ItemDraftHooks = containerClient.itemHooks
    def itemService: MongoService = new MongoService(db("items"))
    def sessionService: MongoService = new MongoService(db("sessions"))
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
