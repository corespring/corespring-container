package org.corespring.container.client.controllers.player

import play.api.Play
import play.api.mvc.RequestHeader

trait AddUrlParam{

  def addUrlParam[A <% String](url:String, key:String,value:A) : String = {
    if( url.contains("?") ){
      s"$url&$key=$value"
    } else {
      s"$url?$key=$value"
    }
  }
}

trait PlayerQueryStringOptions {

  import play.api.Play.current

  val playerPage = "playerPage"
  val prodPlayer = "prodPlayer"

  def isProdPlayer(implicit rh:RequestHeader) : Boolean = {
    rh.getQueryString(prodPlayer).map(_ == "true").getOrElse(Play.current.mode == play.api.Mode.Prod)
  }

  def getPlayerPage(implicit rh:RequestHeader) : String = {
    rh.getQueryString(playerPage).getOrElse("player")
  }

  implicit def sToPlayerUrl(s:String) : PlayerUrl = PlayerUrl(s)
  implicit def playerUrlToS(p : PlayerUrl) = p.url

  case class PlayerUrl(url:String) extends AddUrlParam{
    def setProdPlayer(value: Boolean = true) : PlayerUrl = add(prodPlayer, value)
    def setPlayerPage(p:String) : PlayerUrl = add(playerPage, p)

    implicit def bToS(b:Boolean) : String = b.toString

    private def add[A <% String](key:String,value:A) : PlayerUrl = PlayerUrl(addUrlParam(url, key, value))

  }
}
