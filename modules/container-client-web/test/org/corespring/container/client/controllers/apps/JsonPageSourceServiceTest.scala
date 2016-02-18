package org.corespring.container.client.controllers.apps

import org.specs2.mutable.Specification
import org.specs2.specification.Scope

class JsonPageSourceServiceTest extends Specification {

  trait scope extends Scope {
    lazy val loadResult = Some("{}")
    def load(path: String) = loadResult
    val config = PageSourceServiceConfig("prefix", false, load)
    lazy val service = new JsonPageSourceService(config)
  }

  "loadJs" should {
    "throw an IllegalArgumentException if no path is found" in pending
    "throw an IllegalArgumentException if report can't be loaded" in pending
    "load NgSourcePaths" in pending
  }

  "loadCss" should {
    "throw an IllegalArgumentException if no path is found" in pending
    "throw an IllegalArgumentException if report can't be loaded" in pending
    "load CssSourcePaths" in pending
  }
}
