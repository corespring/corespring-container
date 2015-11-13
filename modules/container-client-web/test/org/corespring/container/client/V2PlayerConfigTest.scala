package org.corespring.container.client

import com.typesafe.config.ConfigFactory
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification._
import play.api.Configuration
import play.api.libs.json.{ JsValue, Json }

class V2PlayerConfigTest extends Specification with Mockito {

  private class TestContext(configJson: String) extends Before {

    def before {}
    val config = ConfigFactory.parseString(configJson)
    val configuration = new Configuration(config)
    val playerConfig = V2PlayerConfig(configuration)
    val newRelicRumConfig: Option[JsValue] = playerConfig.newRelicRumConfig
    val validNewRelicConf = Json.obj(
      "licenseKey" -> "key",
      "applicationID" -> "id",
      "sa" -> 1,
      "beacon" -> "bam.nr-data.net",
      "errorBeacon" -> "bam.nr-data.net",
      "agent" -> "js-agent.newrelic.com/nr-476.min.js")
  }

  "newRelicRumConfig" should {
    "be returned from config if enabled is true" in new TestContext("{corespring:{v2player:{newrelic:{enabled:true, license-key: key, application-id:id}}}}") {
      newRelicRumConfig === Some(validNewRelicConf)
    }
    "be not be returned from config if enabled is false" in new TestContext("{corespring:{v2player:{newrelic:{enabled:false, license-key: key, application-id:id}}}}") {
      newRelicRumConfig === None
    }
    "be converted to proper json config object" in new TestContext("{corespring:{v2player:{newrelic:{enabled:true, license-key: key, application-id:id}}}}") {
      import NewRelicRumConfig.writes
      Json.toJson(newRelicRumConfig.get) === validNewRelicConf
    }
  }
}