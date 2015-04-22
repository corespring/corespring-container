package org.corespring.container.client.integration

import org.corespring.container.client.controllers._
import org.corespring.container.client.controllers.apps._
import org.corespring.container.client.controllers.resources.{ Item, ItemDraft, Session }
import play.api.mvc.Controller

trait CommonControllers {

  /** urls for component sets eg one or more components */
  def componentSets: ComponentSets

  /** the 3rd party js launch api */
  def playerLauncher: PlayerLauncher

  /** load files from 3rd party dependency libs */
  def libs: ComponentsFileController
}

trait ResourceControllers {

  /** item draft resource */
  def itemDraft: ItemDraft

  /** item resource */
  def item: Item

  /** session resource */
  def session: Session
}

trait RigControllers extends CommonControllers {
  /** the rig app */
  def rig: Rig
}

trait PlayerControllers extends CommonControllers with ResourceControllers {
  def prodHtmlPlayer: Player
}

trait EditorControllers extends CommonControllers with ResourceControllers {
  /** The editor */
  def editor: Editor

  /** The dev editor */
  def devEditor: DevEditor

  /** icons are only used in the editor */
  def icons: Icons
}

trait CatalogControllers extends CommonControllers with ResourceControllers {
  /** The catalog */
  def catalog: Catalog
}

trait ProfileControllers {
  def dataQuery: DataQuery
}

trait ContainerControllers
  extends RigControllers
  with PlayerControllers
  with EditorControllers
  with ProfileControllers
  with CatalogControllers {
  def controllers: Seq[Controller] = Seq(
    componentSets,
    playerLauncher,
    libs,
    item,
    itemDraft,
    session,
    rig,
    prodHtmlPlayer,
    editor,
    devEditor,
    catalog,
    icons,
    dataQuery)
}
