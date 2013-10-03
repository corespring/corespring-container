import com.mongodb.casbah.MongoClient
import org.corespring.container.components.loader.FileComponentLoader
import org.corespring.container.components.response.{ResponseProcessorImpl, ResponseProcessor}
import org.corespring.container.services.SessionService
import org.corespring.shell.impl.controllers.Main
import org.corespring.shell.impl.controllers.editor.ItemImpl
import org.corespring.shell.impl.controllers.player.{PlayerSession, PlayerMainImpl}
import org.corespring.shell.impl.services.MongoService
import org.corespring.shell.impl.utils.ControllerInstanceResolver
import play.api.libs.json.JsValue
import play.api.mvc.Controller
import play.api.{Play, Logger}

object Global extends ControllerInstanceResolver {

  lazy val controllers: Seq[Controller] = Seq(mainPlayer, sessions, home, items)

  private lazy val mongoClient = MongoClient("localhost", 27017)
  private lazy val db = mongoClient("corespring-container")
  private lazy val sessionService = new MongoService(db("sessions"))
  private lazy val itemService = new MongoService(db("items"))
  private lazy val mainPlayer = new PlayerMainImpl(itemService, sessionService, componentLoader.all)

  private lazy val home = new Main {
    def sessionService: MongoService = new MongoService(db("sessions"))

    def itemService: MongoService = new MongoService(db("items"))
  }

  private lazy val items = new ItemImpl {
    def itemService: MongoService = new MongoService(db("items"))
  }

  private lazy val sessions = new PlayerSession {
    def itemService: MongoService = new MongoService(db("items"))

    def responseProcessor: ResponseProcessor = new ResponseProcessorImpl(componentLoader.all)

    def sessionDbService: MongoService = new MongoService(db("sessions"))

    def sessionService: SessionService = new SessionService {
      def save(id: String, session: JsValue): Option[JsValue] = sessionDbService.save(id, session)
    }
  }

  private lazy val componentLoader = new FileComponentLoader(Play.current.configuration.getString("components.path").toSeq)

  override def onStart(app: play.api.Application): scala.Unit = {
    Logger.info("Shell app started")
  }
}
