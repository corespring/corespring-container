package org.corespring.container.js.rhino

import org.corespring.container.components.model.{Id, LibrarySource, Server, Interaction}
import org.corespring.container.components.model.dependencies.ComponentMaker
import org.specs2.mutable.Specification
import play.api.libs.json.Json

class NewRhinoOutcomeProcessorTest extends Specification with ComponentMaker {

  lazy val library = lib("lib").copy(server = Seq(LibrarySource("src-1",
    """
      |exports.ping = function(){
      |  return "pong";
      |}
    """.stripMargin)))
  lazy val interaction = uiComp("interaction", Seq(Id("org", "lib"))).copy(server = Server(
    """
      |var l = require('src-1');
      |exports.respond = function(){
      |  return { msg: l.ping() }
      |}
    """.stripMargin))

  lazy val components = Seq(interaction, library)
  lazy val processor = new NewRhinoOutcomeProcessor(components)

  "new processor" should {
    "execute js" in {
      val item = Json.obj("components" -> Json.obj(
        "1" -> Json.obj(
          "componentType" -> "org-interaction"
        )))
      val session = Json.obj("components" -> Json.obj(
        "1" -> Json.obj(
          "answers" -> "a"
        )
      ))
      val settings = Json.obj()
      processor.createOutcome(item, session, settings) === Json.obj(
        "1" -> Json.obj(
          "msg" -> "response",
        "studentResponse" -> "a")
      )
    }
  }
}
