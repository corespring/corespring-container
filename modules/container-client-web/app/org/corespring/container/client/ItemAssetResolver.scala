package org.corespring.container.client


trait ItemAssetResolver {

  def resolve(itemId:String)(file:String):String = {
    mkPath(itemId)(file)
  }

  protected def mkPath(itemId: String)(imageSrc: String): String = {
    val plainImageSrc = imageSrc.split('/').last
    val playerRoutes = org.corespring.container.client.controllers.apps.routes.Player
    val url = playerRoutes.getFileByItemId(itemId, plainImageSrc).url
    withoutEndingSlash(modulePath) + url
  }

  protected def modulePath: String = v2Player.Routes.prefix

  protected def withoutEndingSlash(s:String): String = {
   if(s.endsWith("/")) s.substring(0,s.length-1) else s
  }
}
