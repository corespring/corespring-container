package org.corespring.container.client

import javax.xml.bind.DatatypeConverter

import org.corespring.container.client.controllers.DefaultComponentSets
import org.corespring.container.client.processing.{ CssMinifier, Gzipper, JsMinifier }
import org.corespring.container.logging.ContainerLogger
import play.api.Configuration
import play.api.http.ContentTypes
import play.api.libs.json.{ JsObject, Json }
import play.api.mvc.{ Action, EssentialAction, RequestHeader, Result }

trait CompressedAndMinifiedComponentSets extends DefaultComponentSets
  with JsMinifier with CssMinifier with Gzipper {

  lazy val logger = ContainerLogger.getLogger("CompressedComponentSets")

  def configuration: Configuration

  private val minifyEnabled = configuration.getBoolean("minify").getOrElse(false)

  private val gzipEnabled = configuration.getBoolean("gzip").getOrElse(false)

  private def acceptsGzip(implicit rh: RequestHeader): Boolean = {
    rh.headers.get(ACCEPT_ENCODING).map(_.split(',').exists(_.trim == "gzip")).getOrElse(false)
  }

  def process(s: String, contentType: String)(implicit rh: RequestHeader): Result = {

    logger.trace(s"process minify? $minifyEnabled, gzip? $gzipEnabled")

    val out: Either[String, String] = contentType match {
      case ss: String if ss == ContentTypes.JAVASCRIPT => if (minifyEnabled) minifyJs(s) else Right(s)
      case ss: String if ss == ContentTypes.CSS => if (minifyEnabled) minifyCss(s) else Right(s)
      case _ => Left(s"unknown content type: $contentType")
    }
    out match {
      case Right(s) => {
        if (gzipEnabled && acceptsGzip) {
          Ok(gzip(s)).as(contentType).withHeaders(CONTENT_ENCODING -> "gzip")
        } else {
          Ok(s).as(contentType)
        }
      }
      case Left(err) => BadRequest(err)
    }
  }

  private def tokenToJson(token: String): JsObject = {
    val decodedColorString = DatatypeConverter.parseBase64Binary(token).map(_.toChar).mkString
    try {
      Json.parse(decodedColorString).as[JsObject]
    } catch {
      case _ => Json.obj()
    }
  }

  override def singleResource[A >: EssentialAction](context: String, componentType: String, suffix: String): A = Action { implicit request =>
    val resourceToken = request.queryString.get("resourceToken")
    val paramsJson = resourceToken match {
      case Some(token) if (token.length > 0) => tokenToJson(token(0))
      case _ => Json.obj()
    }
    val (body, ct) = generate(context, allComponents.find(_.matchesType(componentType)).toSeq, suffix, paramsJson)
    process(body, ct)
  }

  override def resource[A >: EssentialAction](context: String, directive: String, suffix: String) = Action { implicit request =>
    val resourceToken = request.queryString.get("resourceToken")
    val paramsJson = resourceToken match {
      case Some(token) if (token.length > 0) => tokenToJson(token(0))
      case _ => Json.obj()
    }
    val (body, ct) = generateBodyAndContentType(context, directive, suffix, paramsJson)
    process(body, ct)
  }

}

