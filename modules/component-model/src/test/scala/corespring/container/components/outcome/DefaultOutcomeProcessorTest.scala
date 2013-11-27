package org.corespring.container.components.outcome

import org.specs2.mutable.Specification
import play.api.libs.json.Json
import org.corespring.test.utils.JsonCompare
import org.specs2.matcher.{Expectable, Matcher}

class DefaultOutcomeProcessorTest extends Specification{

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
      (item, responses) must GenerateOutcome( expected )
    }
  }


  case class GenerateOutcome(expectedOutcome:String) extends Matcher[(String,String)]{

    def apply[S <: (String,String)](s: Expectable[S]) = {
      result( matchesOutcome(s.value._1, s.value._2),
        s"${s.description} generates expected score",
        s"${s.description} does not generate expected score",
        s)
    }

    private def matchesOutcome(itemDefinition:String,responses:String) : Boolean = {
      val outcome = DefaultScoreProcessor.score(Json.parse(itemDefinition), Json.obj(), Json.parse(responses))
      JsonCompare.caseInsensitiveSubTree(Json.stringify(outcome), expectedOutcome) match{
        case Right(_) => true
        case Left(diffs) => {
          println(diffs.mkString("\n"))
          false
        }
      }
    }
  }

}
