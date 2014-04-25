package org.corespring.container.components.loader

import java.io.File
import org.corespring.container.components.loader.exceptions.ComponentLoaderException
import org.corespring.container.components.model._
import org.corespring.container.utils.string.hyphenatedToTitleCase
import org.slf4j.LoggerFactory
import play.api.libs.json.{ JsObject, Json, JsValue }
import scala.Some

class FileComponentLoader(paths: Seq[String]) extends ComponentLoader {

  private val logger = LoggerFactory.getLogger("components.loader")

  private var loadedComponents: Seq[Component] = Seq.empty

  //TODO: This is only to support dev mode - better name for this // alternatives?
  override def reload: Unit = {
    logger.debug(s"Re-Loading components from paths: $paths")
    loadedComponents = loadAllComponents(paths)
  }

  def all: Seq[Component] = loadedComponents

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
      case "interaction" => loadUiComponent(org, packageJson)(compRoot)
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

  private def loadLibrary(org: String, packageJson: JsValue)(compRoot: File): Option[Component] = {

    def createServerName(n: String) = s"$org.${compRoot.getName}.server${if (n == "index") "" else s".$n"}"

    Some(
      Library(
        org,
        compRoot.getName,
        packageJson,
        loadLibrarySources(compRoot.getPath, "client", createClientName(compRoot.getName)),
        loadLibrarySources(compRoot.getPath, "server", createServerName),
        readMaybeFile(new File(compRoot.getPath + "/src/client/styles.css"))))
  }

  private def loadLayout(org: String, packageJson: JsValue)(compRoot: File): Option[Component] = {
    logger.debug(s"load layout component: ${compRoot.getPath}")
    Some(
      LayoutComponent(
        org,
        compRoot.getName,
        loadLibrarySources(compRoot.getPath, "client", createClientName(compRoot.getPath)),
        readMaybeFile(new File(compRoot.getPath + "/src/client/styles.css")),
        packageJson))
  }

  private def loadUiComponent(org: String, packageJson: JsValue)(compRoot: File): Option[Component] = {

    val clientFolder = new File(compRoot.getPath + "/src/client")
    val serverFolder = new File(compRoot.getPath + "/src/server")
    val icon = new File(compRoot.getPath + "/icon.png")
    val defaultDataJson = new File(clientFolder.getPath + "/defaultData.json")
    val sampleDataFolder = new File(compRoot.getPath + "/sample-data")

    def loadLibraries: Seq[LibraryId] = {
      (packageJson \ "libraries").asOpt[Seq[JsObject]].map {
        seq =>
          seq.map {
            o =>
              val organization = (o \ "organization").asOpt[String]
              val name = (o \ "name").asOpt[String]
              val scope = (o \ "scope").asOpt[String]
              assert(organization.isDefined)
              assert(name.isDefined)
              LibraryId(organization.get, name.get, scope)
          }
      }.getOrElse(Seq.empty)
    }

    Some(
      UiComponent(
        org,
        compRoot.getName,
        (packageJson \ "title").asOpt[String],
        (packageJson \ "titleGroup").asOpt[String],
        loadClient(clientFolder),
        loadServer(serverFolder),
        packageJson,
        loadDefaultData(defaultDataJson),
        loadIcon(icon),
        loadSampleData(sampleDataFolder),
        loadLibraries))
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

  private def loadSampleData(sampleDataFolder: File): Map[String, JsValue] = if (sampleDataFolder.exists) {

    val jsonFiles = sampleDataFolder.listFiles.filter(_.getName.endsWith(".json"))

    val jsonArray = jsonFiles.map {
      f: File =>
        try {
          val contents = readFile(f)
          val json = Json.parse(contents)
          Some((f.getName, json))
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
    val source = scala.io.Source.fromFile(iconFile)(scala.io.Codec.ISO8859)
    val byteArray = source.map(_.toByte).toArray
    source.close()
    Some(byteArray)
  } else None

  private def loadPackageInfo(packageJson: File): JsValue = {
    val s = readFile(packageJson)
    Json.parse(s)
  }

  private def loadClient(client: File): Client = if (!client.exists()) {
    throw new ComponentLoaderException(s"Can't find client file: ${client.getAbsolutePath}")
  } else {
    val renderJs = getJsFromFile(client.getPath + "/render")
    val configureJs = getJsFromFile(client.getPath + "/configure")
    val styleCss = readMaybeFile(new File(client.getPath + "/styles.css"))
    Client(renderJs, configureJs, styleCss)
  }

  private def getJsFromFile(path: String): String = {

    def getJs(p: String) = load(p, (f) => scala.io.Source.fromFile(f).getLines.mkString("\n"))

    def load(p: String, block: File => String) = {
      val f = new File(p)
      if (f.exists()) Some(block(f)) else None
    }
    getJs(path + ".js").getOrElse(throw new ComponentLoaderException(s"Can't find js here: $path"))
  }

  private def loadServer(server: File): Server = if (!server.exists()) {
    throw new ComponentLoaderException(s"Can't find client file: ${server.getAbsolutePath}")
  } else {
    val indexJs = getJsFromFile(server.getPath + "/index")
    Server(indexJs)
  }

  private def readMaybeFile(f: File): Option[String] = {
    if (!f.exists()) {
      logger.debug(s"${f.getPath} does not exist")
      None
    } else {
      Some(scala.io.Source.fromFile(f).getLines().mkString("\n"))
    }
  }

  private def readFile(f: File): String = readMaybeFile(f).getOrElse {
    throw new ComponentLoaderException(s"Can't find client file: ${f.getAbsolutePath}")
  }

}
