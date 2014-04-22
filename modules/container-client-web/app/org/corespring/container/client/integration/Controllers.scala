package org.corespring.container.client.integration

import org.corespring.container.client.controllers.apps.{Catalog, Rig, Editor, Player}
import org.corespring.container.client.component.ComponentUrls
import org.corespring.container.client.controllers.resources.{ Session, Item }
import org.corespring.container.client.controllers._
import play.api.mvc.Controller

trait CommonControllers {

  /** urls for component sets eg one or more components */
  def componentUrls: ComponentUrls

  /** load assets for items (request may come from a session or item based app */
  def assets: Assets

  /** the 3rd party js launch api */
  def playerLauncher: PlayerLauncher

  /** load files from 3rd party dependency libs */
  def libs: ComponentsFileController
}

trait ResourceControllers {

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
  /** The player app */
  def player: Player
}

trait EditorControllers extends CommonControllers with ResourceControllers {
  /** The editor */
  def editor: Editor

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
  with CatalogControllers
{
  def controllers: Seq[Controller] = Seq(
    componentUrls,
    assets,
    playerLauncher,
    libs,
    item,
    session,
    rig,
    player,
    editor,
    catalog,
    icons,
    dataQuery)
}