package org.corespring.shell

import com.mongodb.casbah.{MongoClient, MongoClientURI, MongoDB}
import org.corespring.container.components.loader.FileComponentLoader
import org.corespring.container.components.model.Interaction
import org.corespring.container.logging.ContainerLogger
import org.corespring.play.utils.{CallBlockOnHeaderFilter, ControllerInstanceResolver}
import org.corespring.shell.controllers.{Launchers, Main}
import org.corespring.shell.filters.AccessControlFilter
import org.corespring.shell.services.{ItemDraftService, ItemService, SessionService}
import play.api.libs.json.{JsObject, Json}
import play.api.mvc._
import play.api.{GlobalSettings, Play}

object DefaultPlayerSkin {
  def defaultPlayerSkin: JsObject = Json.obj(
    "colors" -> Json.obj(
      "correct-background" -> "#00ff00",
      "correct-foreground" -> "#f8ffe2",
      "partially-correct-background" -> "#c1e1ac",
      "incorrect-background" -> "#fcb733",
      "incorrect-foreground" -> "#fbf2e3",
      "hide-show-background" -> "#bce2ff",
      "hide-show-foreground" -> "#1a9cff",
      "warning-background" -> "#464146",
      "warning-foreground" -> "#ffffff",
      "warning-block-background" -> "#e0dee0",
      "warning-block-foreground" -> "#f8f6f6"),
    "iconSet" -> "emoji")

}
