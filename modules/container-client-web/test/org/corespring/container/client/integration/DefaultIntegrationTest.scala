package org.corespring.container.client.integration

import org.corespring.container.client.controllers.{ Assets, ComponentSets }
import org.corespring.container.client.hooks._
import org.corespring.container.components.model.Component
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import play.api.{ GlobalSettings, Configuration }
import play.api.libs.json.{ Json, JsObject }
import play.api.mvc.{ AnyContent, Request }
import play.api.test.{ FakeApplication, PlaySpecification, FakeRequest }

import scala.concurrent.{ Future, ExecutionContext }

class DefaultIntegrationTest extends Specification with Mockito with PlaySpecification {

  def mkDefaultIntegration(json: JsObject) = {
    new DefaultIntegration {

      override def versionInfo: JsObject = Json.obj()

      override implicit def ec: ExecutionContext = ExecutionContext.Implicits.global

      override def playerHooks: PlayerHooks = mock[PlayerHooks]

      override def playerLauncherHooks: PlayerLauncherHooks = mock[PlayerLauncherHooks]

      override def catalogHooks: CatalogHooks = mock[CatalogHooks]

      override def editorHooks: EditorHooks = mock[EditorHooks]

      override def dataQueryHooks: DataQueryHooks = mock[DataQueryHooks]

      override def sessionHooks: SessionHooks = {
        val m = mock[SessionHooks]
        m.loadItemAndSession(anyString)(any[Request[AnyContent]]) returns Right(FullSession(json, false))
      }

      override def itemDraftHooks: ItemDraftHooks = mock[ItemDraftHooks]

      override def configuration: Configuration = Configuration.empty

      override def components: Seq[Component] = Seq.empty

      /** load assets for items (request may come from a session or item based app */
      override def assets: Assets = mock[Assets]

      /** urls for component sets eg one or more components */
      override def componentSets: ComponentSets = mock[ComponentSets]
    }
  }

  "DefaultIntegration" should {

    "the loaded session has no correctResponse or feedback" in {

      running(FakeApplication(withGlobal = Some(new GlobalSettings {}))) {
        val mockJson = Json.obj(
          "item" -> Json.obj(
            "components" -> Json.obj(
              "0" -> Json.obj(
                "componentType" -> "type",
                "correctResponse" -> Json.obj("a" -> "b"),
                "feedback" -> Json.obj("fb" -> "A was right")))), "session" -> Json.obj())

        val di = mkDefaultIntegration(mockJson)

        val result = di.session.loadItemAndSession("id")(FakeRequest("", ""))

        val json = contentAsJson(result)

        (json \ "item" \ "components" \ "0" \ "correctResponse").asOpt[JsObject] === None
        (json \ "item" \ "components" \ "0" \ "feedback").asOpt[JsObject] === None
        (json \ "item" \ "components" \ "0" \ "componentType").asOpt[String] === Some("type")

      }
    }
  }
}
