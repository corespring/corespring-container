package org.corespring.container.client.filters

import play.api.Logger
import play.api.mvc.{ RequestHeader, SimpleResult }
import scala.collection.mutable

import scala.concurrent.{ ExecutionContext, Future }

class BlockingFutureRunner(implicit val ec: ExecutionContext) {

  private val futureResults: mutable.Map[String, Future[SimpleResult]] = mutable.Map()

  private val logger = Logger(classOf[BlockingFutureRunner])

  /**
   * Invoke the fn once for a given [[RequestHeader]] and return that [[Future[SimpleResult]]],
   * instead of invoking the fn every time.
   * This method is synchronized to ensure that the map is populated by the first concurrent thread
   * and the remaining threads can use that thread's Future[SimpleResult]
   * @param fn
   * @param rh
   * @return
   */
  def run(fn: RequestHeader => Future[SimpleResult], rh: RequestHeader): Future[SimpleResult] = synchronized {

    futureResults.get(rh.path).foreach{ _ =>
      logger.debug(s"found future for ${rh.path}")
    }

    futureResults.get(rh.path).getOrElse {
      logger.debug(s"path=${rh.path}, id=${rh.id} - add future result for path ... invoke expensive operation")
      val f = fn(rh).map { r =>

        logger.trace(s"path=${rh.path}, result=$r, remove future from results")
        futureResults.remove(rh.path)
        r
      }

      futureResults.put(rh.path, f)
      f
    }
  }
}
