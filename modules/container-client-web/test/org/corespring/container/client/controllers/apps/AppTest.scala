package org.corespring.container.client.controllers.apps

import org.corespring.container.client.component.{ ComponentUrls, ItemTypeReader }
import org.corespring.container.components.model.Component
import org.corespring.test.TestContext
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.Mode
import play.api.Mode.Mode
import play.api.libs.json.JsValue
import play.api.test.FakeRequest

import scala.concurrent.ExecutionContext

class AppTest extends Specification {

  trait scope extends Scope with App[String] with ItemTypeReader with TestContext {
    override def mode: Mode = Mode.Prod

    override def hooks: String = "hooks"

    override def urls: ComponentUrls = ???

    override def context: String = "test"

    /** for an item - return all the components in use */
    override def componentTypes(json: JsValue): Seq[String] = Seq.empty

    override def components: Seq[Component] = Seq.empty
  }

  "buildJs" should {

    trait stubPaths extends scope {
      override def jsSrc: NgSourcePaths = NgSourcePaths(Seq.empty, "prod.js", Seq("other-libs.js"), Seq("ng-module-one"))

      override def cssSrc: CssSourcePaths = CssSourcePaths(Seq.empty, "prod.css", Seq.empty)

      lazy val info = ComponentScriptInfo(Seq("/component-set/corespring[one].js"), Seq.empty, Seq.empty)
      val out = buildJs(info, Seq("extras.js"))(FakeRequest("", ""))
    }

    "returns 3rd party libs at the start" in new stubPaths {
      out(0) === "other-libs.js"
    }

    "returns the main js second" in new stubPaths {
      out(1) === "prod.js"
    }

    "returns the component js third" in new stubPaths {
      out(2) === "/component-set/corespring[one].js"
    }

    "returns the extras last" in new stubPaths {
      out(3) === "extras.js"
    }
  }
}
