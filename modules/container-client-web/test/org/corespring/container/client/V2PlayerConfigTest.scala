package org.corespring.container.client

import com.typesafe.config.ConfigFactory
import org.specs2.mock.Mockito
import org.specs2.mutable.Specification
import org.specs2.specification._
import play.api.Configuration

class V2PlayerConfigTest extends Specification with Mockito {

  def configString(enabled: Boolean) =
    s"""{corespring:{v2player:{newrelic:{enabled:$enabled, license-key: key, application-id:id}}}}"""

  class scope(configJson: String) extends Scope {

    val config = ConfigFactory.parseString(configJson)
    val configuration = new Configuration(config)
    val playerConfig = V2PlayerConfig(configuration)
  }

  "apply" should {
    "return a new config" in new scope(configString(true)) {
      playerConfig.newRelicRumConfig must_== Some(NewRelicRumConfig("key", "id"))
    }

    "not return a config if enabled is false" in new scope(configString(false)) {
      playerConfig.newRelicRumConfig === None
    }

    "set useNewRelic to false, if enabled is false" in new scope(configString(false)) {
      playerConfig.useNewRelic === false
    }

    "be converted to proper json config object" in new scope(configString(true)) {
      playerConfig.newRelicRumConfig.map(_.json) === Some(NewRelicRumConfig("key", "id").json)
    }
  }
}