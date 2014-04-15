package org.corespring.shell

import com.mongodb.casbah.{ MongoDB, MongoClientURI, MongoClient }
import org.corespring.container.components.loader.FileComponentLoader
import org.corespring.mongo.json.services.MongoService
import org.corespring.play.utils.{ CallBlockOnHeaderFilter, ControllerInstanceResolver }
import org.corespring.shell.controllers.Main
import org.corespring.shell.filters.AccessControlFilter
import play.api.mvc.{ RequestHeader, WithFilters, Controller }
import play.api.{ GlobalSettings, Logger, Play }

object Global extends WithFilters(AccessControlFilter, CallBlockOnHeaderFilter) with ControllerInstanceResolver with GlobalSettings {

  private lazy val logger = Logger("shell.global")

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
    new MongoService(db("ccstandards")),
    componentLoader.all,
    Play.current.configuration)

  private lazy val home = new Main {
    def itemService: MongoService = new MongoService(db("items"))
    def sessionService: MongoService = new MongoService(db("sessions"))
    def standardsService: MongoService = new MongoService(db("ccstandards"))
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
      if (rh.path.contains(".html") && componentLoader != null) {
        logger.info("reload components!")
        componentLoader.reload
      }
    }
  }

  private lazy val componentLoader = {
    val out = new FileComponentLoader(Play.current.configuration.getString("components.path").toSeq)
    out.reload
    out
  }

}
