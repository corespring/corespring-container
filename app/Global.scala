import com.mongodb.casbah.{MongoDB, MongoClientURI, MongoClient}
import org.corespring.container.components.loader.FileComponentLoader
import org.corespring.mongo.json.services.MongoService
import org.corespring.play.utils.{CallBlockOnHtmlFilter, ControllerInstanceResolver}
import org.corespring.shell.ContainerClientImplementation
import org.corespring.shell.controllers.Main
import org.corespring.shell.filters.AccessControlFilter
import play.api.mvc.{WithFilters, Controller}
import play.api.{GlobalSettings, Logger, Play}

object Global extends WithFilters(AccessControlFilter, CallBlockOnHtmlFilter) with ControllerInstanceResolver with GlobalSettings{

  private lazy val logger = Logger("global")

  lazy val controllers: Seq[Controller] = containerClient.controllers :+ home

  private lazy val mongoUri = {
    val uri = Play.current.configuration.getString("mongo.db").getOrElse("mongodb://localhost:27017/corespring-container")
    logger.debug(s"uri: $uri")
    MongoClientURI(uri)
  }

  private lazy val mongoClient = MongoClient(mongoUri)

  private lazy val db : MongoDB = {
    logger.debug(s"u: ${mongoUri.username}, p: ${mongoUri.password}")
    mongoClient( mongoUri.database.getOrElse("corespring-container-devt"))
  }

  private lazy val containerClient = new ContainerClientImplementation(
    new MongoService(db("items")),
    new MongoService(db("sessions")),
    componentLoader.all,
    Play.current.configuration)

  private lazy val home = new Main {
    def sessionService: MongoService = new MongoService(db("sessions"))
    def itemService: MongoService = new MongoService(db("items"))
  }

  override def onStart(app:play.api.Application) : Unit = {
    CallBlockOnHtmlFilter.block = () => {
      logger.info("reload components!")
      if(componentLoader != null) componentLoader.reload
    }
  }

  private lazy val componentLoader = {
    val out = new FileComponentLoader(Play.current.configuration.getString("components.path").toSeq)
    out.reload
    out
  }

}
