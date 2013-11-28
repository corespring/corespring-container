import com.mongodb.casbah.{MongoDB, MongoClientURI, MongoClient}
import org.corespring.container.components.loader.FileComponentLoader
import org.corespring.shell.impl.ContainerClientImplementation
import org.corespring.shell.impl.controllers.Main
import org.corespring.shell.impl.filters.{AccessControlFilter, ReloadComponentsFilter}
import org.corespring.shell.impl.services.MongoService
import org.corespring.shell.impl.utils.ControllerInstanceResolver
import play.api.{Logger, Play}
import play.api.mvc.{WithFilters, Controller}

object Global extends WithFilters(AccessControlFilter, ReloadComponentsFilter) with ControllerInstanceResolver {

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
    ReloadComponentsFilter.components = componentLoader
  }

  private lazy val componentLoader = {
    val out = new FileComponentLoader(Play.current.configuration.getString("components.path").toSeq)
    out.reload
    out
  }

}
