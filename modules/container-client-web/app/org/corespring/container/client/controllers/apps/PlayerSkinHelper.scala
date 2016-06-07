package org.corespring.container.client.controllers.apps

import javax.xml.bind.DatatypeConverter
import play.api.libs.json.{JsObject, JsValue, Json}


trait PlayerSkinHelper {

  def calculateColorToken(queryParams: JsObject, defaults: JsValue) = {
    val colorsParam = (queryParams \ "colors").asOpt[String]
    val defaultColors = (defaults \ "colors").asOpt[JsObject].getOrElse(Json.obj())
    val colorsJson = colorsParam match {
      case Some(colorsString) => (Json.parse(DatatypeConverter.parseBase64Binary(colorsString)) \ "colors").asOpt[JsObject].getOrElse(Json.obj())
      case None => Json.obj()
    }
    val computedColors = Json.obj("colors" -> (defaultColors ++ colorsJson))
    DatatypeConverter.printBase64Binary(computedColors.toString.getBytes)
  }

  def calculateIconSet(queryParams: JsObject, defaults: JsValue) = {
    val iconsetParam = (queryParams \ "iconSet").asOpt[String]
    val defaultIconSet = (defaults \ "iconSet").asOpt[String]
    iconsetParam.orElse(defaultIconSet).getOrElse("check")
  }


}
