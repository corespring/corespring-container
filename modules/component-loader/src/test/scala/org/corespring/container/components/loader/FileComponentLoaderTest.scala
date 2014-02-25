package org.corespring.container.components.loader

import org.specs2.mutable.Specification
import org.corespring.container.components.model.{ LayoutComponent, UiComponent, Library }

class FileComponentLoaderTest extends Specification {

  val rootPath = "modules/component-loader/src/test/resources/org/corespring/container/components/loader"

  "FileComponentLoader" should {

    def getLoader(p: String) = {
      val path = s"$rootPath/$p"
      val loader = new FileComponentLoader(Seq(path))
      loader.reload
      loader
    }

    "load all the components from the given file path" in {
      val loader = getLoader("one")
      loader.all.length === 1
    }

    "load a library" in {
      val loader = getLoader("two")
      loader.all.length === 1
      loader.all(0).isInstanceOf[Library] === true
      val lib = loader.all(0).asInstanceOf[Library]
      lib.client.length == 2
      lib.client.map(_.name).contains("MyLib") === true
      lib.client.map(_.name).contains("Other") === true
      lib.server.length == 2
      lib.server.map(_.name).contains("corespring.my-lib.server") === true
      lib.server.map(_.name).contains("corespring.my-lib.server.other") === true
    }

    "a ui component can specify a library" in {
      val loader = getLoader("three")
      val lib = loader.all(0)
      lib match {
        case UiComponent(_, _, _, _, _, _, _, _, libs) => {
          libs.length === 1
          libs(0).org === "org-name"
          libs(0).name === "lib-name"
          success
        }
        case _ => failure("not a Ui component")
      }
    }

    "load a layout component" in {
      val loader = getLoader("four")
      val comp = loader.all(0)

      comp match {
        case LayoutComponent(org, name, client, _, _) => {
          org === "corespring"
          name === "layout-comp"
          client.length === 1
          success
        }
        case _ => failure("not a layout component")
      }
    }
  }

}
