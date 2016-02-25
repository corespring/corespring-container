package org.corespring.container.client.integration

import org.corespring.container.client.controllers._
import org.corespring.container.client.controllers.launcher.editor.EditorLauncher
import org.corespring.container.client.controllers.launcher.player.PlayerLauncher
import play.api.mvc.Controller

trait CommonControllers {

  /** urls for component sets eg one or more components */
  def componentSets: ComponentSets

  /** the 3rd party js launch api */
  def playerLauncher: PlayerLauncher

  def editorLauncher: EditorLauncher

  /** load files from 3rd party dependency libs */
  def libs: ComponentsFileController
}

trait EditorControllers extends CommonControllers  {
  /** icons are only used in the editor */
  def icons: Icons
}

trait ProfileControllers {
  def dataQuery: DataQuery
}

trait ContainerControllers
  extends ProfileControllers
  with EditorControllers
{
  def controllers: Seq[Controller] = Seq(
    componentSets,
    playerLauncher,
    editorLauncher,
    libs,
    icons,
    dataQuery)
}
