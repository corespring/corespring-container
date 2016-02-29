package org.corespring.container.client.component

import org.corespring.container.components.model.dependencies.ComponentSplitter
import org.corespring.container.components.model.{ Component, Id }
import play.api.Mode
import play.api.Mode._
import play.api.libs.json.JsValue

class DefaultComponentService(mode: Mode, loadComps: => Seq[Component]) extends ComponentSplitter with ComponentService {

  private var loadedComponents: Seq[Component] = Seq.empty

  override def components: Seq[Component] = (mode, loadedComponents) match {
    case (Mode.Prod, Nil) => {
      loadedComponents = loadComps
      loadedComponents
    }
    case (Mode.Prod, x :: _) => loadedComponents
    case _ => loadComps
  }

  //superceding [[PlayerItemTypeReader]]
  override def idsInItem(json: JsValue): Seq[Id] = {
    ItemComponentTypes(interactions, widgets, layoutComponents, json).map(_.id)
  }
}
