package org.corespring.container.components.loader

import java.io.File

import org.apache.commons.io.FileUtils
import org.corespring.container.components.loader.exceptions.ComponentLoaderException
import org.corespring.container.components.model._
import org.corespring.container.utils.string.hyphenatedToTitleCase
import org.corespring.container.logging.ContainerLogger
import play.api.libs.json.{ JsValue, Json }

class FileComponentLoader(paths: Seq[String])
  extends ComponentLoader
  with PackageJsonReading {

  private val logger = ContainerLogger.getLogger("FileComponentLoader")

  private var loadedComponents: Seq[Component] = Seq.empty

  //TODO: This is only to support dev mode - better name for this // alternatives?
  override def reload: Unit = {
    logger.debug(s"Re-Loading components from paths: $paths")
    loadedComponents = loadAllComponents(paths)
  }

  def all: Seq[Component] = {
    logger.trace(s"loaded: ${loadedComponents.length}")
    logger.trace(loadedComponents.map(c => s"${c.componentType} - ${c.getClass.getSimpleName}").mkString("\n"))
    loadedComponents
  }

  private def loadAllComponents(paths: Seq[String]): Seq[Component] = {
    paths.map {
      p =>
        val root = new File(p)

        def isOrgFolder(f: File) = f.isDirectory && !f.getName.startsWith(".")

        if (root.exists()) {
          val c: Seq[Component] = root.listFiles.toSeq.filter(isOrgFolder).map(loadOrgComponents).flatten
          c
        } else {
          Seq()
        }
    }.flatten
  }

  private def loadOrgComponents(orgRoot: File): Seq[Component] = {
    logger.debug(s"loadOrgComponents: ${orgRoot.getPath}")
    val org = orgRoot.getName
    orgRoot.listFiles().toSeq.filter(_.isDirectory).map(loadComponent(org)).flatten
  }

  private def loadComponent(org: String)(compRoot: File): Option[Component] = {

    logger.debug(s"loadComponent: $org : ${compRoot.getPath}")

    val packageFile = new File(compRoot.getPath + "/package.json")
    val packageJson = loadPackageInfo(packageFile)
    val purpose = (packageJson \ "purpose").asOpt[String].getOrElse("interaction")

    purpose match {
      case "interaction" => loadInteraction(org, packageJson)(compRoot)
      case "widget" => loadWidget(org, packageJson)(compRoot)
      case "library" => loadLibrary(org, packageJson)(compRoot)
      case "layout" => loadLayout(org, packageJson)(compRoot)
      case _ => throw new RuntimeException(s"Unknown purpose: [$purpose] for component: ${compRoot.getPath}")
    }
  }

  private def loadLibrarySources(path: String, target: String, nameFn: String => String): Seq[LibrarySource] = {
    val child = new File(s"$path/src/$target")
    val children = child.listFiles()
    if (children == null) {
      Seq.empty
    } else {
      children.toSeq.filter(_.getName.endsWith(".js")).map {
        f =>
          val sourceName = f.getName.replace(".js", "")
          val name = nameFn(sourceName)
          LibrarySource(name, readFile(f))
      }
    }
  }

  private def createClientName(path: String)(n: String) = {
    val name = (if (n == "index") path else n)
    hyphenatedToTitleCase(name)
  }

  private def loadCssOrLess(root: String, maybeFiles: Seq[String]) = {
    maybeFiles
      .map(filename => readMaybeFile(new File(s"${if (root.endsWith("/")) root else s"$root/"}$filename")))
      .find(!_.isEmpty).flatten
  }
  private def loadCss(root: String): Option[String] = loadCssOrLess(root, Seq("styles.css"))
  private def loadLess(root: String): Option[String] = loadCssOrLess(root, Seq("styles.less"))

  private def loadLibrary(org: String, packageJson: JsValue)(compRoot: File): Option[Component] = {

    def createServerName(n: String) = s"$org.${compRoot.getName}.server${if (n == "index") "" else s".$n"}"

    Some(
      Library(
        org,
        compRoot.getName,
        packageJson,
        loadLibrarySources(compRoot.getPath, "client", createClientName(compRoot.getName)),
        loadLibrarySources(compRoot.getPath, "server", createServerName),
        loadLess(s"${compRoot.getPath}/src/client"),
        loadLibraries(packageJson)))
  }

  private def loadLayout(org: String, packageJson: JsValue)(compRoot: File): Option[Component] = {
    logger.debug(s"load layout component: ${compRoot.getPath}")

    Some(
      LayoutComponent(
        org = org,
        name = compRoot.getName,
        released = false,
        insertInline = false,
        client = loadLibrarySources(compRoot.getPath, "client", createClientName(compRoot.getPath)),
        less = loadLess(s"${compRoot.getPath}/src/client"),
        packageInfo = packageJson))
  }

  private def loadWidget(org: String, packageJson: JsValue)(compRoot: File): Option[Widget] = load[Widget](org,
    packageJson, compRoot) { ld =>
      Widget(
        org = ld.org,
        name = ld.name,
        title = ld.title,
        titleGroup = ld.titleGroup,
        client = ld.client,
        released = false,
        insertInline = false,
        packageInfo = packageJson,
        defaultData = ld.defaultData,
        icon = ld.icon,
        sampleData = ld.sampleData,
        libraries = ld.libs)
    }

  /** a interim model for building interaction */
  case class LoadedData(org: String,
    name: String,
    title: Option[String],
    titleGroup: Option[String],
    client: Client,
    defaultData: JsValue,
    insertInline: Option[Boolean],
    released: Option[Boolean],
    icon: Option[Array[Byte]],
    sampleData: Map[String, JsValue],
    libs: Seq[Id])

  object LoadedData {
    def apply(org: String, packageJson: JsValue, compRoot: File): LoadedData = {
      val clientFolder = new File(compRoot.getPath + "/src/client")
      val icon = new File(compRoot.getPath + "/icon.png")
      val defaultDataJson = new File(clientFolder.getPath + "/defaultData.json")
      val sampleDataFolder = new File(compRoot.getPath + "/sample-data")
      val regressionDataFolder = new File(compRoot.getPath + "/regression-data")

      LoadedData(
        org = org,
        name = compRoot.getName,
        title = (packageJson \ "title").asOpt[String],
        titleGroup = (packageJson \ "titleGroup").asOpt[String],
        insertInline = (packageJson \ "insertInline").asOpt[Boolean],
        released = (packageJson \ "released").asOpt[Boolean],
        client = loadClient(clientFolder,
          loadLibrarySources(compRoot.getPath, "client/render-lib", createClientName(compRoot.getPath)),
          loadLibrarySources(compRoot.getPath, "client/configure-lib", createClientName(compRoot.getPath))),
        defaultData = loadDefaultData(defaultDataJson),
        icon = loadIcon(icon),
        sampleData = loadSampleData(sampleDataFolder) ++ loadSampleData(regressionDataFolder, Some("regression_")),
        libs = loadLibraries(packageJson))
    }
  }

  private def load[C <: Component](org: String, packageJson: JsValue, compRoot: File)(make: LoadedData => C): Option[C] =
    Some(make(LoadedData(org, packageJson, compRoot)))

  private def loadInteraction(org: String, packageJson: JsValue)(compRoot: File): Option[Interaction] =
    load[Interaction](org, packageJson, compRoot) { ld =>

      val serverFolder = new File(compRoot.getPath + "/src/server")

      Interaction(
        org = ld.org,
        name = ld.name,
        title = ld.title,
        titleGroup = ld.titleGroup,
        released = ld.released.getOrElse(false),
        insertInline = ld.insertInline.getOrElse(false),
        client = ld.client,
        server = loadServer(serverFolder),
        packageInfo = packageJson,
        defaultData = ld.defaultData,
        icon = ld.icon,
        sampleData = ld.sampleData,
        libraries = ld.libs)
    }

  private def loadDefaultData(dataJson: File): JsValue = if (dataJson.exists) {
    try {
      Json.parse(readFile(dataJson))
    } catch {
      case e: Throwable => {
        logger.warn(s"Error parsing json ${dataJson.getPath}")
        Json.obj()
      }
    }
  } else Json.obj()

  private def loadSampleData(sampleDataFolder: File, prefix: Option[String] = None): Map[String, JsValue] =
    if (sampleDataFolder.exists) {
      val jsonFiles = sampleDataFolder.listFiles.filter(_.getName.endsWith(".json"))

      val jsonArray = jsonFiles.map {
        f: File =>
          try {
            val contents = readFile(f)
            val json = Json.parse(contents)
            prefix match {
              case Some(pre) => {
                Some((s"$pre${f.getName}", json))
              }
              case _ => Some((f.getName, json))
            }
          } catch {
            case e: Throwable => {
              logger.warn(s"Error parsing: ${f.getPath}: ${e.getMessage}")
              None
            }
          }
      }.flatten
      Map(jsonArray: _*)
    } else Map.empty

  private def loadIcon(iconFile: File): Option[Array[Byte]] = if (iconFile.exists) {
    val byteArray = FileUtils.readFileToByteArray(iconFile)
    Some(byteArray)
  } else None

  private def loadPackageInfo(packageJson: File): JsValue = {
    val s = readFile(packageJson)
    Json.parse(s)
  }

  private def loadClient(client: File, renderLibs: Seq[LibrarySource], configureLibs: Seq[LibrarySource]): Client = if (!client.exists()) {
    throw new ComponentLoaderException(s"Can't find client file: ${client.getAbsolutePath}")
  } else {
    val renderJs = getJsFromFile(client.getPath + "/render")
    val configureJs = getJsFromFile(client.getPath + "/configure")
    val styleLess = loadLess(client.getPath)
    Client(renderJs, configureJs, styleLess, renderLibs, configureLibs)
  }

  private def loadServer(server: File): Server = if (!server.exists()) {
    throw new ComponentLoaderException(s"Can't find client file: ${server.getAbsolutePath}")
  } else {
    val indexJs = getJsFromFile(server.getPath + "/index")
    Server(indexJs)
  }

  private def getJsFromFile(path: String): String = {
    readFile(new File(path + ".js"))
  }

  private def readFile(f: File): String = readMaybeFile(f).getOrElse {
    throw new ComponentLoaderException(s"Can't find client file: ${f.getAbsolutePath}")
  }

  private def readMaybeFile(f: File): Option[String] = {
    if (!f.exists()) {
      logger.debug(s"${f.getPath} does not exist")
      None
    } else {
      Some(FileUtils.readFileToString(f))
    }
  }

}
