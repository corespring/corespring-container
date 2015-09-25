package org.corespring.container.client

import org.corespring.container.client.controllers.DefaultComponentSets
import org.corespring.container.client.processing.{ CssMinifier, Gzipper, JsMinifier }
import org.corespring.container.logging.ContainerLogger
import play.api.Configuration
import play.api.http.ContentTypes
import play.api.mvc._

import scala.concurrent.Future

trait CompressedAndMinifiedComponentSets extends DefaultComponentSets
  with JsMinifier with CssMinifier with Gzipper with HasContext {

  lazy val logger = ContainerLogger.getLogger("CompressedComponentSets")

  def configuration: Configuration

  private val minifyEnabled = configuration.getBoolean("minify").getOrElse(false)

  private val gzipEnabled = configuration.getBoolean("gzip").getOrElse(false)

  private def acceptsGzip(implicit rh: RequestHeader): Boolean = {
    rh.headers.get(ACCEPT_ENCODING).map(_.split(',').exists(_.trim == "gzip")).getOrElse(false)
  }

  def process(s: String, contentType: String)(implicit rh: RequestHeader): SimpleResult = {

    logger.warn(s"function=process - this is an expensive operation! use sparingly.")
    logger.trace(s"process minify? $minifyEnabled, gzip? $gzipEnabled")

    val out: Either[String, String] = contentType match {
      case ss: String if ss == ContentTypes.JAVASCRIPT => if (minifyEnabled) minifyJs(s) else Right(s)
      case ss: String if ss == ContentTypes.CSS => if (minifyEnabled) minifyCss(s) else Right(s)
      case _ => Left(s"unknown content type: $contentType")
    }
    out match {
      case Right(s) => {
        if (gzipEnabled && acceptsGzip) {
          val zipped = gzip(s)
          Ok(zipped).as(contentType).withHeaders(CONTENT_ENCODING -> "gzip", CONTENT_LENGTH -> zipped.length.toString)
        } else {
          Ok(s).as(contentType).withHeaders(CONTENT_LENGTH -> s.getBytes("UTF-8").length.toString)
        }
      }
      case Left(err) => BadRequest(err)
    }
  }

  override def singleResource[A >: EssentialAction](context: String, componentType: String, suffix: String): A = Action.async {
    implicit request => Future {
      val (body, ct) = generate(context, allComponents.find(_.matchesType(componentType)).toSeq, suffix)
      process(body, ct)
    }
  }

  override def resource[A >: EssentialAction](context: String, directive: String, suffix: String) = Action.async {
    implicit request => Future {
      val (body, ct) = generateBodyAndContentType(context, directive, suffix)
      process(body, ct)
    }
  }

}

