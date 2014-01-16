import sbt._
import Keys._
import play.Project._
import sbtrelease.ReleasePlugin._

class Builders(org: String, rootScalaVersion: String) {

  Keys.fork in ThisBuild := false

  val cred = {
    val envCredentialsPath = System.getenv("CREDENTIALS_PATH")
    val path = if (envCredentialsPath != null) envCredentialsPath else Seq(Path.userHome / ".ivy2" / ".credentials").mkString
    val f: File = file(path)
    if (f.exists()) {
      println("[credentials] using credentials file")
      Credentials(f)
    } else {
      //https://devcenter.heroku.com/articles/labs-user-env-compile
      def repoVar(s: String) = System.getenv("ARTIFACTORY_" + s)
      val args = Seq("REALM", "HOST", "USER", "PASS").map(repoVar)
      println("[credentials] args: " + args)
      Credentials(args(0), args(1), args(2), args(3))
    }
  }

  val sharedSettings = releaseSettings ++ Seq(
    credentials += cred,
    Keys.fork in Test := false,
    Keys.parallelExecution in Test := false,
    publishTo <<= version {
      (v: String) =>
        def isSnapshot = v.trim.contains("-")
        val base = "http://repository.corespring.org/artifactory"
        val repoType = if (isSnapshot) "snapshot" else "release"
        val finalPath = base + "/ivy-" + repoType + "s"
        Some("Artifactory Realm" at finalPath)
    }
  )

  def lib(name: String, rootFile: Option[String] = None) = {
    val root = file(rootFile.getOrElse(s"modules/$name"))
    sbt.Project(name, root)
      .settings(organization := org, scalaVersion := rootScalaVersion)
      .settings(sharedSettings: _*)
  }

  def playApp(name: String, rootFile: Option[String] = None) = lib(name, rootFile).settings(playScalaSettings: _*)

}