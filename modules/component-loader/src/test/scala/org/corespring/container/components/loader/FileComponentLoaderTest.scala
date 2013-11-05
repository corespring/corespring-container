package org.corespring.container.components.loader

import org.specs2.mutable.Specification
import org.corespring.container.components.model.Library

class FileComponentLoaderTest extends Specification {

  val rootPath = "modules/component-loader/src/test/resources/org/corespring/container/components/loader"
  "FileComponentLoader" should {

    "load all the components from the given file path" in {
      val path = s"$rootPath/one"
      val loader = new FileComponentLoader(Seq(path))
      loader.reload
      loader.all.length === 1
    }


    "load a library" in {
      val path = s"$rootPath/two"
      val loader = new FileComponentLoader(Seq(path))
      loader.reload
      loader.all.length === 1
      loader.all(0).isInstanceOf[Library] === true

    }
  }

}
