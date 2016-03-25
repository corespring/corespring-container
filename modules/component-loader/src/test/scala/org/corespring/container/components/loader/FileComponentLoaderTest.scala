package org.corespring.container.components.loader

import org.specs2.mutable.Specification
import org.corespring.container.components.model.{ Widget, Interaction, LayoutComponent, Library }

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
      loader.all(0) match {
        case i: Interaction =>
          i.released == true
          success
        case _ =>
          failure
      }
    }

    "load an interaction" in {
      val loader = getLoader("one")
      val component = loader.all(0)

      component.isInstanceOf[Interaction] === true
      val interaction = component.asInstanceOf[Interaction]

      interaction.title.get === "Single Choice"
      interaction.titleGroup.get === "Fixed Choice"
      interaction.released === false
      interaction.insertInline === false
      interaction.client.renderLibs.length === 2
      interaction.client.configureLibs.length === 1
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
      lib.css.get.startsWith("body") mustEqual true
      lib.less.get.startsWith("body") mustEqual true
    }

    "an interaction can specify a library" in {
      val loader = getLoader("three")
      val lib = loader.all(0)
      lib match {
        case i: Interaction => {
          i.libraries.length === 1
          i.libraries(0).org === "org-name"
          i.libraries(0).name === "lib-name"
          success
        }
        case _ => failure("not an Interaction")
      }
    }

    "load a layout component" in {
      val loader = getLoader("four")
      val comp = loader.all(0)

      comp match {
        case l: LayoutComponent => {
          l.org === "corespring"
          l.name === "layout-comp"
          l.client.length === 1
          success
        }
        case _ => failure("not a layout component")
      }
    }

    "load a widget" in {
      val loader = getLoader("five")
      val comp = loader.all(0)

      comp match {
        case w: Widget =>
          w.org === "corespring"
          w.name == "widget"
          success
        case _ => failure("not a widget")
      }
    }
  }

}
