package org.corespring.shell.controllers

import org.specs2.mutable.Specification
import play.api.libs.json.{ Json, JsObject }

class ShellAssetsUtilsTest extends Specification {

  val sut = new ShellAssetsUtils {}

  "contentType" should {

    "return mpeg/audio for .mp3" in {
      sut.contentType("test.mp3") === "audio/mpeg"
    }

    "return image/png for unknown extensions" in {
      sut.contentType("test.XXX") === "image/png"
    }

    "return image/png for files without extension" in {
      sut.contentType("test") === "image/png"
    }
  }

}
