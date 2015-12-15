package org.corespring.container.client


trait ItemAssetResolver {

  def resolve(itemId:String)(file:String):String = {
    mkPath(itemId)(file)
  }

  protected def mkPath(itemId: String)(imageSrc: String): String = {
    val plainImageSrc = imageSrc.split('/').last
    modulePath + org.corespring.container.client.controllers.apps.routes.Player.getFileByItemId(itemId, plainImageSrc).url
  }

  protected def modulePath: String = v2Player.Routes.prefix
}
