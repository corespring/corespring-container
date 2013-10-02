import com.mongodb.casbah.MongoClient
import org.corespring.container.components.loader.FileComponentLoader
import org.corespring.shell.impl.controllers.{PlayerSession, PlayerMainImpl}
import org.corespring.shell.impl.services.MongoService
import org.corespring.shell.impl.utils.ControllerInstanceResolver
import play.api.mvc.Controller
import play.api.{Play, Logger}

object Global extends ControllerInstanceResolver {


  lazy val controllers: Seq[Controller] = Seq(mainPlayer, sessions)

  private lazy val mongoClient = MongoClient("localhost", 27017)
  private lazy val db = mongoClient("corespring-container")
  private lazy val mainPlayer = new PlayerMainImpl(new MongoService(db("items")), componentLoader.all)

  private lazy val sessions = new PlayerSession {
    def sessionService: MongoService = new MongoService(db("sessions"))
  }

  private lazy val componentLoader = new FileComponentLoader(Play.current.configuration.getString("components.path").toSeq)

  override def onStart(app: play.api.Application): scala.Unit = {
    Logger.info("Shell app started")
  }
}
