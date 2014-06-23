package org.corespring.container.components.outcome

import org.specs2.mutable.Specification
import play.api.libs.json.Json
import org.corespring.test.utils.JsonCompare
import org.specs2.matcher.{ Expectable, Matcher }

class DefaultScoreProcessorTest extends Specification {

  "default score processor" should {

    "generate an score for one component" in {

      ("""{"components":{"3":{"weight":4}}}""", """{"3":{"score":1.0}}""") must GenerateOutcome("""
         {
           "summary" : { "maxPoints" : 4, "points" : 4.0, "percentage" : 100.0 },
           "components" : {
             "3" : { "weight" : 4, "score" : 1.0, "weightedScore" : 4.0}
           }
         }
        """)
    }

    "generate an score for two component" in {

      val item = """{
             "components": {
               "3" : {"weight":4},
               "4" : {"weight":5}
             }
           }"""
      val responses = """{
             "3" : {"score":0.1},
             "4" : {"score":0.6}
            }"""
      val expected = """
         {
           "summary" : { "maxPoints" : 9, "points" : 3.4, "percentage" : 37.8 },
           "components" : {
             "3" : { "weight" : 4, "score" : 0.1, "weightedScore" : 0.4},
             "4" : { "weight" : 5, "score" : 0.6, "weightedScore" : 3.0}
           }
         }
                     """
      (item, responses) must GenerateOutcome(expected)
    }

    "generate an score for two simple components" in {

      val item = """{
             "components": {
               "1" : {"weight":1},
               "2" : {"weight":1}
             }
           }"""
      val responses = """{
             "1" : {"score":1.0},
             "2" : {"score":1.0}
            }"""
      val expected = """
         {
           "summary" : { "maxPoints" : 2, "points" : 2.0, "percentage" : 100.0 },
           "components" : {
             "1" : { "weight" : 1, "score" : 1.0, "weightedScore" : 1.0},
             "2" : { "weight" : 1, "score" : 1.0, "weightedScore" : 1.0}
           }
         }
                     """
      (item, responses) must GenerateOutcome(expected)
    }

    "zero weight is not counted in score" in {

      val item = """{
             "components": {
               "1" : {"weight":1},
               "2" : {"weight":0}
             }
           }"""
      val responses = """{
             "1" : {"score":0.0},
             "2" : {"score":1.0}
            }"""
      val expected = """
         {
           "summary" : { "maxPoints" : 1, "points" : 0.0, "percentage" : 0.0 },
           "components" : {
             "1" : { "weight" : 1, "score" : 0.0, "weightedScore" : 0.0},
             "2" : { "weight" : 0, "score" : 1.0, "weightedScore" : 0.0}
           }
         }
                     """

      (item, responses) must GenerateOutcome(expected)
    }

    "calculate the proper sum" in {
      DefaultScoreProcessor.getSumOfWeightedScores(
        Json.obj(
          "1" -> Json.obj("weightedScore" -> 1.0),
          "2" -> Json.obj("weightedScore" -> 1.0))) must be equalTo 2.0

    }
  }

  case class GenerateOutcome(expectedOutcome: String) extends Matcher[(String, String)] {

    def apply[S <: (String, String)](s: Expectable[S]) = {
      result(matchesOutcome(s.value._1, s.value._2),
        s"${s.description} generates expected score",
        s"${s.description} does not generate expected score",
        s)
    }

    private def matchesOutcome(itemDefinition: String, responses: String): Boolean = {
      val outcome = DefaultScoreProcessor.score(Json.parse(itemDefinition), Json.obj(), Json.parse(responses))
      JsonCompare.caseInsensitiveSubTree(Json.stringify(outcome), expectedOutcome) match {
        case Right(_) => true
        case Left(diffs) => {
          println(diffs.mkString("\n"))
          false
        }
      }
    }
  }

}
