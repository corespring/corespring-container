import com.mongodb.casbah.MongoClient
import org.corespring.container.components.loader.FileComponentLoader
import org.corespring.shell.impl.ContainerClientImplementation
import org.corespring.shell.impl.controllers.Main
import org.corespring.shell.impl.filters.ReloadComponentsFilter
import org.corespring.shell.impl.services.MongoService
import org.corespring.shell.impl.utils.ControllerInstanceResolver
import play.api.Play
import play.api.mvc.{WithFilters, Controller}

object Global extends WithFilters(ReloadComponentsFilter) with ControllerInstanceResolver {

  lazy val controllers: Seq[Controller] = containerClient.controllers :+ home

  private lazy val mongoClient = MongoClient("localhost", 27017)
  private lazy val db = mongoClient("corespring-container")

  private lazy val containerClient = new ContainerClientImplementation(
    new MongoService(db("items")),
    new MongoService(db("sessions")),
    componentLoader.all)

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
