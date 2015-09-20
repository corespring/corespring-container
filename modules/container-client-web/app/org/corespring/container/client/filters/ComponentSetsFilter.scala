package org.corespring.container.client.filters

import java.io.{ InputStream, PipedInputStream, PipedOutputStream }

import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.model.{ ObjectMetadata, S3Object }
import play.api.Logger
import play.api.http.Status._
import play.api.libs.iteratee.{ Enumerator, Iteratee }
import play.api.mvc.Results._
import play.api.mvc.{ Filter, RequestHeader, ResponseHeader, SimpleResult }
import play.api.http.HeaderNames._
import scala.concurrent.{ ExecutionContext, Future }

/**
 * This filter intercepts calls to paths containing 'component-sets'.
 * It check to see it the result of the request is on S3.
 * - if there is an etag present it just checks for that and returns a 304 if it matches
 * - if there's no etag it just returns the s3 data (with etag).
 *
 * - if the data isn't on s3, it invokes the underlying request, puts the result on s3,
 * then adds the etag to that result.
 */
trait ComponentSetsFilter extends Filter {

  lazy val logger = Logger(classOf[ComponentSetsFilter])

  implicit def ec: ExecutionContext

  def s3: AmazonS3

  def appVersion: String

  def bucket: String

  def enabled: Boolean

  logger.info(s"enabled=$enabled")

  val blockingRunner = new BlockingFutureRunner

  private def acceptsGzip(implicit rh: RequestHeader): Boolean = {
    rh.headers.get(ACCEPT_ENCODING).map(_.split(',').exists(_.trim == "gzip")).getOrElse(false)
  }

  private def s3oToResult(s3o: S3Object): Future[SimpleResult] = Future {
    val inputStream: InputStream = s3o.getObjectContent()
    val objContent: Enumerator[Array[Byte]] = Enumerator.fromStream(inputStream)
    val metadata = s3o.getObjectMetadata
    val contentType = metadata.getContentType()
    val encoding = {
      val e = metadata.getContentEncoding
      if (e == null) None else Some(e)
    }

    val headers: Map[String, String] = Map(
      CONTENT_TYPE -> (if (contentType != null) contentType else "application/octet-stream"),
      CONTENT_LENGTH.toString -> metadata.getContentLength.toString,
      ETAG -> metadata.getETag) ++ encoding.map(e => CONTENT_ENCODING -> e)

    SimpleResult(header = ResponseHeader(200, headers), body = objContent)
  }

  def tryToLoadFromS3(key: String, etag: Option[String], loadAndSaveUnderlyingResult: => Future[SimpleResult]) = {

    def tryS3(body: => Future[SimpleResult])(fallback: => Future[SimpleResult]) = try {
      body
    } catch {
      case t: Throwable => {
        logger.info(s"function=tryToLoadFromS3#tryS3 - an error occured in the body")
        fallback
      }
    }

    etag.map { e =>
      tryS3 {
        logger.debug(s"function=tryToLoadFromS3, key=$key, bucket=$bucket - try to load metadata")
        val metadata = s3.getObjectMetadata(bucket, key)
        if (metadata.getETag == e) {
          logger.debug(s"function=tryToLoadFromS3, key=$key, bucket=$bucket - etag == metadata.etag - return $NOT_MODIFIED")
          Future(NotModified)
        } else {
          logger.debug(s"function=tryToLoadFromS3, key=$key, bucket=$bucket - etag != metadata.etag - call underlying")
          loadAndSaveUnderlyingResult
        }
      }(loadAndSaveUnderlyingResult)
    }.getOrElse {
      tryS3 {
        logger.debug(s"function=tryToLoadFromS3, key=$key, bucket=$bucket - try to load object")
        val s3o = s3.getObject(bucket, key)
        logger.debug(s"function=tryToLoadFromS3, key=$key, bucket=$bucket - found s3 object - create result from it")
        s3oToResult(s3o)
      } {
        loadAndSaveUnderlyingResult
      }
    }
  }

  override def apply(f: (RequestHeader) => Future[SimpleResult])(rh: RequestHeader): Future[SimpleResult] = {

    if (rh.path.contains("component-sets")) {
      logger.trace(s"function=apply, enabled=$enabled, id=${rh.id}")
    }

    if (rh.path.contains("component-sets") && enabled) {

      val path = {
        val base = s"components/$appVersion/${rh.path}"
        if (acceptsGzip(rh)) {
          s"$base.gz"
        } else {
          base
        }
      }.replace("//", "/")

      logger.debug(s"function=apply, path=$path, bucket=$bucket")

      tryToLoadFromS3(path, rh.headers.get(IF_NONE_MATCH), blockingRunner.run( _ => {

        logger.warn(s"function=tryToLoadFromS3, id=${rh.id} - about to call an asset compilation operation")
        val futureAssetResult = f(rh)

        futureAssetResult.flatMap { res =>

          val outputStream = new PipedOutputStream()
          val inputStream = new PipedInputStream(outputStream)

          // The iteratee that writes to the output stream
          val iteratee = Iteratee.foreach[Array[Byte]] { bytes =>
            logger.trace("write bytes..")
            outputStream.write(bytes)
          }

          val metadata = new ObjectMetadata()
          metadata.setContentLength(res.header.headers.get(CONTENT_LENGTH).get.toLong)
          metadata.setContentType(res.header.headers.get(CONTENT_TYPE).get)
          res.header.headers.get(CONTENT_ENCODING).map { e =>
            metadata.setContentEncoding(e)
          }
          //Note: My guess is that if we slam the server
          //A tonne of threads all attempt to put the object,
          //and the streams aren't closing or the request never completes
          //and you get a tonne of timeouts.
          logger.debug(s"function=apply, id=${rh.id}, put response on s3")
          // Feed the body into the iteratee
          val f: Future[Unit] = (res.body |>>> iteratee)
          val putResult = s3.putObject(bucket, path, inputStream, metadata)
          val o: Future[SimpleResult] = f.andThen {
            case result =>
              logger.debug(s"function=apply, id=${rh.id} close the output and input streams")
              // Close the output stream whether there was an error or not
              outputStream.close()
              inputStream.close()
              // Get the result or rethrow the error
              result.get
          }.map(_ => res.withHeaders(ETAG -> putResult.getETag))
          o
        }
      }, rh))
    } else {
      f(rh)
    }
  }
}