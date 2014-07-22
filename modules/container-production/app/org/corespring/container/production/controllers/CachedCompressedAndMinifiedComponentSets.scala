package org.corespring.container.production.controllers

import org.corespring.container.client.controllers.DefaultComponentSets
import org.corespring.container.production.processing.{ CssMinifier, Gzipper, JsMinifier }
import play.api.Configuration
import play.api.cache.Cached
import play.api.http.ContentTypes
import play.api.mvc.{ Action, EssentialAction, RequestHeader, Result }

trait CachedCompressedAndMinifiedComponentSets extends DefaultComponentSets
  with JsMinifier with CssMinifier with Gzipper {

  import play.api.Play.current

  def configuration: Configuration

  def minifyEnabled = configuration.getBoolean("minify").getOrElse(false)

  def cachingEnabled = configuration.getBoolean("cache").getOrElse(false)

  def gzipEnabled = configuration.getBoolean("gzip").getOrElse(false)

  def process(s: String, contentType: String)(implicit rh: RequestHeader): Result = {
    val out: Either[String, String] = contentType match {
      case ss: String if ss == ContentTypes.JAVASCRIPT => if (minifyEnabled) minifyJs(s) else Right(s)
      case ss: String if ss == ContentTypes.CSS => if (minifyEnabled) minifyCss(s) else Right(s)
      case _ => Left(s"unknown content type: $contentType")
    }
    out match {
      case Right(s) => {
        if (gzipEnabled && rh.headers.get(ACCEPT_ENCODING) == Some("gzip")) {
          Ok(gzip(s)).as(contentType).withHeaders(CONTENT_ENCODING -> "gzip")
        } else {
          Ok(s).as(contentType)
        }
      }
      case Left(err) => BadRequest(err)
    }
  }

  override def resource[A >: EssentialAction](context: String, directive: String, suffix: String) = if (cachingEnabled) {
    Cached(s"$context-$directive-$suffix") {
      Action { implicit request =>
        val (body, ct) = generateBodyAndContentType(context, directive, suffix)
        process(body, ct)
      }
    }
  } else {
    Action { implicit request =>
      val (body, ct) = generateBodyAndContentType(context, directive, suffix)
      process(body, ct)
    }
  }

}

