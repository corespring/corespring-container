package org.corespring.container.client.controllers.helpers

import org.specs2.mutable.Specification

class XhtmlCleanerTest extends Specification {

  "XhtmlCleaner" should {
    "cleanXhtml" should {

      val s =
        """
          |<itembody><corespring-teacher-instructions id="teacher-instructions-1501207744"></corespring-teacher-instructions><p><strong>Annabel went to the beach for the day and rented a surfboard.  The surfboard rental was $7.00 per hour, plus a rental fee of $12.00.</strong><br /><br /><strong>Part A:
          |<br /><br>Which equation could Annabel use to find the total cost (<em>c</em>) of renting a surfboard for
          |<em>x</em> amount of hours?</strong></p><corespring-multiple-choice id="RESPONSE1"></corespring-multiple-choice><div><strong>Part B:</strong><br /><br /><strong>What would be the total cost of Annabel renting the surfboard for 6 hours?</strong><br /><br />
          |<strong>$</strong><corespring-text-entry id="RESPONSE21"></corespring-text-entry></div></itembody>0
        """.stripMargin

      "not trim whitesspace" in {

        val c = new XhtmlCleaner {}

        val out = c.cleanXhtml(s)

        out === s.replace("<br>", "<br />")
      }
    }
  }
}
