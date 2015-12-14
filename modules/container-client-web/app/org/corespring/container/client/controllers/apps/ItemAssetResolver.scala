package org.corespring.container.client.controllers.apps


trait ItemAssetResolver {

  def resolve(itemId:String)(file:String):String = {
    mkPath(itemId)(file)
  }

  protected def mkPath(itemId: String)(imageSrc: String): String = {
    val plainImageSrc = imageSrc.split('/').last
    modulePath + "/player/item/" + itemId + "/" + plainImageSrc
  }

  protected def modulePath: String = v2Player.Routes.prefix
}
