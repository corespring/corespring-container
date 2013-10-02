package org.corespring.container.components.loader

import org.specs2.mutable.Specification

class FileComponentLoaderTest extends Specification {

  "FileComponentLoader" should {

    "load all the components from the given file path" in {
      val path = "modules/component-loader/src/test/resources/org/corespring/container/components/loader/one"
      val loader = new FileComponentLoader(Seq(path))
      loader.all.length === 1
    }

    "load js from coffeescript the components from the given file path" in {
      val path = "modules/component-loader/src/test/resources/org/corespring/container/components/loader/two"
      val loader = new FileComponentLoader(Seq(path))
      loader.all.length === 1
      loader.all(0).client.render.contains("console.log(\"render.coffee\")") === true
    }
  }

}
