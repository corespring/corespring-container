package org.corespring.shell

import java.net.URL

import com.amazonaws.services.s3.AmazonS3
import com.softwaremill.macwire.MacwireMacros.wire
import org.bson.types.ObjectId
import org.corespring.amazon.s3.{ ConcreteS3Service, S3Service }
import org.corespring.container.client._
import org.corespring.container.client.component.{ ComponentSetExecutionContext, ComponentsConfig }
import org.corespring.container.client.hooks._
import org.corespring.container.client.integration.{ ContainerConfig, ContainerExecutionContext, DefaultIntegration }
import org.corespring.container.components.model.Component
import org.corespring.shell.controllers.catalog.actions.{ CatalogHooks => ShellCatalogHooks }
import org.corespring.shell.controllers.editor.ContainerSupportingMaterialAssets
import org.corespring.shell.controllers.editor.actions.{ DraftId, DraftEditorHooks => ShellDraftEditorHooks, ItemEditorHooks => ShellItemEditorHooks }
import org.corespring.shell.controllers.player.actions.{ PlayerHooks => ShellPlayerHooks }
import org.corespring.shell.controllers.player.{ SessionHooks => ShellSessionHooks }
import org.corespring.shell.controllers.{ S3Config, ShellAssets, ShellDataQueryHooks, editor => shellEditor }
import org.corespring.shell.services.{ ItemDraftService, ItemService, SessionService }
import play.api.Mode.Mode
import play.api.{ Configuration, Logger, Mode, Play }

import scala.concurrent.ExecutionContext

class ContainerClientImplementation(
  val itemService: ItemService,
  val sessionService: SessionService,
  val draftItemService: ItemDraftService,
  componentsIn: => Seq[Component],
  configuration: Configuration) extends DefaultIntegration {

  override def resolveDomain(path: String): String = {
    val separator = if (path.startsWith("/")) "" else "/"
    configuration.getString("cdn.domain").map { d =>
      logger.trace(s"cdn.domain: $d")
      s"$d$separator$path"
    }.getOrElse(path)
  }

  lazy val logger = Logger(this.getClass)

  override def components: Seq[Component] = componentsIn

  override lazy val containerContext: ContainerExecutionContext = new ContainerExecutionContext(ExecutionContext.global)

  import org.corespring.shell

  override lazy val playerLauncherHooks: PlayerLauncherHooks = wire[shell.controllers.player.PlayerLauncherHooks]

  val s3 = S3Config(
    key = configuration.getString("amazon.s3.key").getOrElse("?"),
    secret = configuration.getString("amazon.s3.secret").getOrElse("?"),
    bucket = configuration.getString("amazon.s3.bucket").getOrElse(throw new RuntimeException("No bucket specified")))

  lazy val s3Client: AmazonS3 = {
    val fakeEndpoint = configuration.getString("amazon.s3.fake-endpoint")
    logger.trace(s"fakeEndpoint: $fakeEndpoint")
    S3Service.mkClient(s3.key, s3.secret, fakeEndpoint)
  }

  lazy val (playS3, assetUtils) = {
    val s3Service = new ConcreteS3Service(s3Client)
    val assetUtils = new AssetUtils(s3Client, s3.bucket)
    (s3Service, assetUtils)
  }

  lazy val itemSupportingMaterialAssets = new ContainerSupportingMaterialAssets[String](
    s3.bucket,
    s3Client,
    playS3,
    (id: String, rest: Seq[String]) => ("items" +: id +: "materials" +: rest).mkString("/").replace("~", "/"))

  lazy val itemDraftSupportingMaterialAssets = new ContainerSupportingMaterialAssets[DraftId[ObjectId]](
    s3.bucket,
    s3Client,
    playS3,
    (id: DraftId[ObjectId], rest: Seq[String]) => ("item-drafts" +: id.itemId +: id.name +: "materials" +: rest).mkString("/").replace("~", "/"))

  lazy val assets = wire[ShellAssets] //new Assets with ItemDraftAssets with ItemAssets {

  override lazy val componentSetExecutionContext = {
    ComponentSetExecutionContext(ContainerClientImplementation.this.containerContext.context)
  }

  override lazy val draftEditorHooks: DraftEditorHooks = wire[ShellDraftEditorHooks]
  override lazy val itemEditorHooks: ItemEditorHooks = wire[ShellItemEditorHooks]
  override lazy val catalogHooks: CatalogHooks = wire[ShellCatalogHooks]
  override lazy val sessionHooks = wire[ShellSessionHooks]
  override lazy val itemDraftHooks: CoreItemHooks with DraftHooks = wire[shellEditor.ItemDraftHooks]
  override lazy val itemDraftSupportingMaterialHooks: ItemDraftSupportingMaterialHooks = wire[shellEditor.ItemDraftSupportingMaterialHooks]
  override lazy val itemHooks: CoreItemHooks with CreateItemHook = wire[shellEditor.ItemHooks]
  override lazy val itemSupportingMaterialHooks: ItemSupportingMaterialHooks = wire[shellEditor.ItemSupportingMaterialHooks]
  override lazy val playerHooks: PlayerHooks = wire[ShellPlayerHooks]
  override lazy val dataQueryHooks: DataQueryHooks = wire[ShellDataQueryHooks] // with withContext
  override lazy val versionInfo: VersionInfo = VersionInfo(Play.current.configuration)
  override lazy val collectionHooks: CollectionHooks = wire[shellEditor.CollectionHooks]
  override lazy val itemMetadataHooks: ItemMetadataHooks = wire[shellEditor.ItemMetadataHooks] //{
  override val loadResource: (String) => Option[URL] = play.api.Play.current.resource(_)

  private val mode = Play.current.mode

  override val containerConfig: ContainerConfig = ContainerConfig(
    mode,
    showNonReleasedComponents = configuration.getBoolean("components.showNonReleasedComponents").getOrElse(mode == Mode.Dev),
    editorDebounceInMillis = configuration.getLong("editor.autosave.debounceInMillis").getOrElse(5000),
    components = ComponentsConfig.fromConfig(mode, configuration),
    player = V2PlayerConfig(
      rootUrl = configuration.getString("rootUrl"),
      newRelicRumConfig = configuration.getConfig("newrelic").flatMap { c => NewRelicRumConfig.fromConfig(c) }))
}
