import com.mongodb.casbah.MongoClient
import org.corespring.container.components.loader.FileComponentLoader
import org.corespring.shell.impl.{ControllerInstanceResolver, ItemService, PlayerMainImpl}
import play.api.{Play, Logger}
import play.api.mvc.Controller

object Global extends ControllerInstanceResolver {


  lazy val controllers: Seq[Controller] = Seq(mainPlayer)

  private lazy val mongoClient = MongoClient("localhost", 27017)
  private lazy val db = mongoClient("corespring-container")
  private lazy val mainPlayer = new PlayerMainImpl(new ItemService(db("items")), componentLoader.all)
  private lazy val componentLoader = new FileComponentLoader(Play.current.configuration.getString("components.path").toSeq)

  override def onStart(app: play.api.Application): scala.Unit = {
    Logger.info("Shell app started")
  }
}
