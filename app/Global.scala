import com.mongodb.casbah.MongoClient
import org.corespring.container.components.loader.FileComponentLoader
import org.corespring.container.components.model.Component
import org.corespring.container.components.response.{ResponseProcessorImpl, ResponseProcessor}
import org.corespring.shell.impl.controllers.Main
import org.corespring.shell.impl.controllers.editor.{EditorHooksImpl, ClientItemImpl}
import org.corespring.shell.impl.controllers.player.{PlayerHooksImpl, ClientSessionImpl}
import org.corespring.shell.impl.services.MongoService
import org.corespring.shell.impl.utils.ControllerInstanceResolver
import play.api.mvc.Controller
import play.api.{Play, Logger}

object Global extends ControllerInstanceResolver {

  lazy val controllers: Seq[Controller] = Seq(playerHooks, editorHooks, sessions, home, items)

  private lazy val mongoClient = MongoClient("localhost", 27017)
  private lazy val db = mongoClient("corespring-container")

  private lazy val playerHooks = new PlayerHooksImpl {

    def itemService: MongoService = new MongoService(db("items"))

    def loadedComponents: Seq[Component] = componentLoader.all

    def sessionService: MongoService = new MongoService(db("sessions"))
  }


  private lazy val editorHooks = new EditorHooksImpl {
    def itemService: MongoService = new MongoService(db("items"))

    def loadedComponents: Seq[Component] = componentLoader.all
  }

  private lazy val home = new Main {
    def sessionService: MongoService = new MongoService(db("sessions"))

    def itemService: MongoService = new MongoService(db("items"))
  }

  private lazy val items = new ClientItemImpl {
    def itemService: MongoService = new MongoService(db("items"))
  }

  private lazy val sessions = new ClientSessionImpl {
    def itemService: MongoService = new MongoService(db("items"))

    def responseProcessor: ResponseProcessor = new ResponseProcessorImpl(componentLoader.all)

    def sessionService: MongoService = new MongoService(db("sessions"))

  }

  private lazy val componentLoader = new FileComponentLoader(Play.current.configuration.getString("components.path").toSeq)

  override def onStart(app: play.api.Application): scala.Unit = {
    Logger.info("Shell app started")
  }
}
