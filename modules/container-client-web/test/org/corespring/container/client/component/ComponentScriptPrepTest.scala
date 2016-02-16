package org.corespring.container.client.component

import org.corespring.container.client.controllers.apps.{ PageSourceService, NgSourcePaths, CssSourcePaths }
import org.corespring.container.client.pages.processing.AssetPathProcessor
import org.corespring.container.components.model.Component
import org.corespring.test.TestContext
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification.Scope
import play.api.Mode
import play.api.Mode.Mode
import play.api.Mode.Mode
import play.api.test.FakeRequest

class ComponentScriptPrepTest extends Specification with Mockito {

  trait scope extends Scope with ComponentScriptPrep with TestContext {

    override def urls: ComponentUrls = mock[ComponentUrls]

    override def components: Seq[Component] = Seq.empty

    override def mode: Mode = Mode.Test

    override def assetPathProcessor: AssetPathProcessor = new AssetPathProcessor {
      override def process(s: String): String = s
    }

    override def pageSourceService: PageSourceService = mock[PageSourceService]
  }

  "buildJs" should {

    trait stubPaths extends scope {
      override def jsSrc(context: String): NgSourcePaths = NgSourcePaths(Seq.empty, "prod.js", Seq("other-libs.js"), Seq("ng-module-one"))

      override def cssSrc(context: String): CssSourcePaths = CssSourcePaths(Seq.empty, "prod.css", Seq.empty)

      lazy val info = ComponentScriptInfo("type", Seq("/component-set/corespring[one].js"), Seq.empty, Seq.empty)
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
