import sbt._
import Keys._
import play.Project._

class Builders(org:String, appVersion:String, rootScalaVersion:String) {

  def lib(name: String, folder:String = "lib", deps: Seq[sbt.ClasspathDep[sbt.ProjectReference]] = Seq.empty) =

    //Needed for play 2.1.x
    //++ intellijCommandSettings("SCALA")

    sbt.Project(
      name,
      file("modules/" + name),
      dependencies = deps)
      .settings( Defaults.defaultSettings  ++ intellijCommandSettings("SCALA") : _* )
      .settings(
      organization := org,
      version := appVersion,
      scalaVersion := rootScalaVersion)

  def testLib(name:String) = lib(name, "test-lib")

  def playApp(name:String, appPath : Option[String] = None, deps: Seq[ClasspathDep[ProjectReference]] = Seq.empty) = {

    val projectFile = file(appPath.getOrElse( "modules/" + name) )
    play.Project(
      name,
      appVersion,
      path = projectFile
    ).settings( play.Project.defaultScalaSettings : _* ).settings(
      organization := org,
      scalaVersion := rootScalaVersion )
  }

}