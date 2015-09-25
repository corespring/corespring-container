package org.corespring.container.client.filters

import java.util.concurrent.CyclicBarrier

import play.api.mvc.SimpleResult
import play.api.test.{ FakeRequest, PlaySpecification }
import play.api.mvc.Results._

import scala.concurrent.Future
import scala.collection.mutable

class BlockingFutureRunnerTest extends PlaySpecification {

  import scala.concurrent.ExecutionContext.Implicits.global

  "run" should {

    "synchronize simultaneous requests so that later requests get the result of the first" in {
      val runner = new BlockingFutureRunner
      val range = 1 to 4
      val m: mutable.Map[String, Future[SimpleResult]] = mutable.Map.empty
      /** Use CyclicBarrier to simulate simultaneous thread execution */
      val gate: CyclicBarrier = new CyclicBarrier(5)
      val threads = range.map { i =>
        new Thread {
          override def run = {
            gate.await()
            val fr: Future[SimpleResult] = runner.run(_ => {
              Future {
                //Pad the latency of the result body to allow the other requests to come in and be synchrized
                Thread.sleep(300)
                Ok(i.toString)
              }
            }, FakeRequest())
            m.put(i.toString, fr)
          }
        }
      }

      threads.foreach { _.start }
      gate.await()
      Thread.sleep(100)
      val contents = m.values.map { fr => contentAsString(fr) }
      contents must_== (1 to 4).map(_ => contents.head)
    }
  }
}
