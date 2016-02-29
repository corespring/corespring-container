package org.corespring.container.client.component

import org.corespring.container.components.model.{ Component, Id, Interaction, Widget }
import play.api.libs.json.JsValue

trait ComponentService {
  def components: Seq[Component]

  def interactions: Seq[Interaction]

  def widgets: Seq[Widget]

  def idsInItem(json: JsValue): Seq[Id]
}
