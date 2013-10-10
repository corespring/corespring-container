package org.corespring.container.components.loader

import java.io.File
import org.corespring.container.components.loader.exceptions.ComponentLoaderException
import org.corespring.container.components.model.{Server, Client, Component}
import org.slf4j.LoggerFactory
import play.api.libs.json.{Json, JsValue}

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

    val clientFolder = new File(compRoot.getPath + "/src/client")
    val serverFolder = new File(compRoot.getPath + "/src/server")
    val packageJson = new File(compRoot.getPath + "/package.json")

    Some(
      Component(
        org,
        compRoot.getName,
        loadClient(clientFolder),
        loadServer(serverFolder),
        loadPackageInfo(packageJson),
        None
      )
    )
  }

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
