package org.corespring.container.client.controllers.launcher

import java.io.{ InputStream, File }

import org.apache.commons.io.IOUtils
import play.api.Play

object JsResource {

  /**
   * Read a js resource from the classpath
   * @param p
   * @return name (without suffix) -> source
   */
  def pathToNameAndContents(p: String): (String, String) = {
    import grizzled.file.GrizzledFile._
    import Play.current
    Play.resource(p).map {
      r =>
        val name = new File(r.getFile).basename.getName.replace(".js", "")

        val input = r.getContent().asInstanceOf[InputStream]
        try {
          val contents = IOUtils.toString(input)
          input.close()
          (name, contents)
        } catch {
          case e: Throwable => throw new RuntimeException("Error converting input to string", e)
        } finally {
          IOUtils.closeQuietly(input)
        }
    }.getOrElse {
      throw new RuntimeException(s"Can't find resource for path: $p")
    }
  }
}

