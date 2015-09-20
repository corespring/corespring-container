package org.corespring.container.client.filters

import play.api.Logger
import play.api.mvc.{RequestHeader, SimpleResult}
import scala.collection.mutable

import scala.concurrent.{ExecutionContext, Future}

class BlockingFutureRunner(implicit val ec: ExecutionContext) {

  private val futureResults : mutable.Map[String,Future[SimpleResult]] = mutable.Map()

  private val logger = Logger(classOf[BlockingFutureRunner])

  /**
   * Run the first fn for the given path and return that future,
   * instead of invoking the function each time.
   * This method is synchronized to ensure that the map is populated so that the remaining threads
   * can make use of the first invocations Future.
   * When the first is complete, return it's result.
   * @param fn
   * @param rh
   * @return
   */
  def run(fn:RequestHeader => Future[SimpleResult], rh:RequestHeader) : Future[SimpleResult] = synchronized {

    futureResults.get(rh.path).getOrElse{
      logger.debug(s"path=${rh.path}, id=${rh.id} - add future result for path ... invoke expensive operation")
      val f = fn(rh).map{ r =>
        futureResults.remove(rh.path)
        r
      }
      futureResults.put(rh.path, f)
      f
    }
  }
}
