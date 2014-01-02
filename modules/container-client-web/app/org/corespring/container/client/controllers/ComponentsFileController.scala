package org.corespring.container.client.controllers

import java.io.File
import org.joda.time.DateTimeZone
import org.joda.time.format.{DateTimeFormatter, DateTimeFormat}
import play.api.Logger
import play.api.libs.MimeTypes
import play.api.libs.iteratee.Enumerator
import play.api.mvc._
import scala.concurrent.ExecutionContext

/** A very simple file asset loader for now */
trait ComponentsFileController extends Controller {

  val log : Logger = Logger("FileController")

  def componentsPath : String
  def defaultCharSet : String

  private val timeZoneCode = "GMT"

  //Dateformatter is immutable and threadsafe
  private val df: DateTimeFormatter =
    DateTimeFormat.forPattern("EEE, dd MMM yyyy HH:mm:ss '" + timeZoneCode + "'").withLocale(java.util.Locale.ENGLISH).withZone(DateTimeZone.forID(timeZoneCode))

  private def loadFile(p: String): Option[(File, Map[String, String])] = {
    val gzipped = new File(s"$p.gz")

    if (gzipped.exists)
      Some((gzipped, Map(CONTENT_ENCODING -> "gzip")))
    else {
      val file = new File(p)
      if (file.exists)
        Some((file, Map()))
      else
        None
    }
  }

  def at(org:String, component:String, filename:String) : Action[AnyContent] = Action{ request =>


    import ExecutionContext.Implicits.global

    val fullPath = s"$componentsPath/$org/$component/libs/$filename"
    log.debug( s"fullPath: $fullPath")
    loadFile(fullPath).map {
      tuple =>

        val (file, headers) = tuple
        val url = file.toURI().toURL()

      lazy val (length, resourceData) = {
        val stream = url.openStream()
        try {
          (stream.available, Enumerator.fromStream(stream))
        } catch {
          case e : Throwable => (-1, Enumerator[Array[Byte]]())
        }
      }

      def addCharsetIfNeeded(mimeType: String): String = if (MimeTypes.isText(mimeType))
        "; charset=" + defaultCharSet
      else ""

      val response = SimpleResult(
        header = ResponseHeader(OK, headers ++ Map(
          CONTENT_LENGTH -> length.toString,
          CONTENT_TYPE -> MimeTypes.forFileName(filename).map(m => m + addCharsetIfNeeded(m)).getOrElse(BINARY),
          DATE -> df.print({ new java.util.Date }.getTime))),
        resourceData,
        HttpConnection.KeepAlive)

      response

    }.getOrElse(NotFound)
  }

}
