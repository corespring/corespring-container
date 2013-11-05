package org.corespring.container.components.loader

import java.io.File
import org.corespring.container.components.loader.exceptions.ComponentLoaderException
import org.corespring.container.components.model._
import org.slf4j.LoggerFactory
import play.api.libs.json.{JsObject, Json, JsValue}
import scala.Some

class FileComponentLoader(paths: Seq[String]) extends ComponentLoader {

  private val logger = LoggerFactory.getLogger("components.loader")

  private var loadedComponents : Seq[Component] = Seq.empty

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
        if (root.exists()) {
          val c: Seq[Component] = root.listFiles.toSeq.filter(_.isDirectory).map(loadOrgComponents).flatten
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
    val isLibrary = (packageJson \ "isLibrary").asOpt[Boolean].getOrElse(false)

    if (isLibrary) {
      loadLibrary(org, packageJson)(compRoot)
    } else {
      loadUiComponent(org, packageJson)(compRoot)
    }

  }

  private def loadLibrary(org: String, packageJson: JsValue)(compRoot: File): Option[Component] = {

    def loadLibrarySources(folder: String): Seq[LibrarySource] = {
      val child = new File(s"${compRoot.getPath}/src/$folder")
      val children = child.listFiles()
      if (children == null) {
        Seq.empty
      } else {
        children.filter(_.getName.endsWith(".js")).map(  f => LibrarySource(f.getName, readFile(f)) ).toSeq
      }
    }

    Some(
      Library(
        org,
        compRoot.getName,
        packageJson,
        loadLibrarySources("client"),
        loadLibrarySources("server")
      )
    )
  }


private def loadUiComponent (org: String, packageJson: JsValue) (compRoot: File): Option[Component] = {

val clientFolder = new File(compRoot.getPath + "/src/client")
    val serverFolder = new File(compRoot.getPath + "/src/server")
    val icon = new File(compRoot.getPath + "/icon.png")
    val defaultDataJson = new File(clientFolder.getPath + "/defaultData.json")
    val sampleDataFolder = new File(compRoot.getPath + "/sample-data")

  def loadLibraries: Seq[Id] = {
    (packageJson \ "libraries").asOpt[Seq[JsObject]].map {
      seq =>
        seq.map {
          o =>
            val organization = (o \ "organization").asOpt[String]
            val name = (o \ "name").asOpt[String]
            assert(organization.isDefined)
            assert(name.isDefined)
            Id(organization.get, name.get)
        }
    }.getOrElse(Seq.empty)
  }

  Some(
      UiComponent (
        org,
        compRoot.getName,
        loadClient(clientFolder),
        loadServer(serverFolder),
        packageJson,
        loadDefaultData(defaultDataJson),
        loadIcon(icon),
        loadSampleData(sampleDataFolder),
        loadLibraries
      )
    )
  }

  private def loadDefaultData(dataJson : File) : JsValue = if(dataJson.exists){
    try {
      Json.parse(readFile(dataJson))
    } catch {
      case e : Throwable => {
        logger.warn( s"Error parsing json ${dataJson.getPath}")
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
    val styleCss = readMaybeFile( new File(client.getPath + "/styles.css"))
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
      None
    } else {
      Some(scala.io.Source.fromFile(f).getLines().mkString("\n"))
    }
  }

  private def readFile(f: File): String = readMaybeFile(f).getOrElse{
    throw new ComponentLoaderException(s"Can't find client file: ${f.getAbsolutePath}")
  }

}
