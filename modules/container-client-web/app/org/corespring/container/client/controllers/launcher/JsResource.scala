package org.corespring.container.client.controllers.launcher

import java.io.{File, InputStream}
import java.net.URL

import org.apache.commons.io.IOUtils

trait PathToString{

  protected def loadURL : String => Option[URL]

  def loadPath(p: String): Option[String] = {

    loadURL(p).map { r =>
      val input = r.getContent().asInstanceOf[InputStream]
      try {
        val contents = IOUtils.toString(input)
        input.close()
        contents
      } catch {
        case e: Throwable => throw new RuntimeException("Error converting input to string", e)
      } finally {
        IOUtils.closeQuietly(input)
      }
    }
  }
}

private[launcher] object PlayResourceToString extends PathToString{

  def apply(s:String) : Option[String] = loadPath(s)

  override protected def loadURL: (String) => Option[URL] = {
    play.api.Play.current.resource(_)
  }
}


trait JsResource {

  def load : String => Option[String]

  /**
   * Read a js resource from the classpath
   *
   * @param p
   * @return name (without suffix) -> source
   */
  def pathToNameAndContents(p: String): (String, String) = {
    load(p).map{ contents =>
      import grizzled.file.GrizzledFile._
      val name = new File(p).basename.getName.replace(".js", "")
      name -> contents
    }.getOrElse {
      throw new RuntimeException(s"Can't find resource for path: $p")
    }
  }
}

