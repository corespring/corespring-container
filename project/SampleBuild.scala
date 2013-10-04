import sbt._
import Keys._
import play.Project._
import java.net._
import scala.Some

/*object Build extends sbt.Build{

  val appName = "TestTwo"
  val appVersion = "0.1"
  val appDependencies = Seq.empty
  val rootScalaVersion = "2.10.2"


  val client = sbt.Project( appName + "-child", file("modules/child"), dependencies = Seq.empty).settings(
        organization := "ed",
        version := appVersion,
        scalaVersion := rootScalaVersion
      )

  val main = play.Project(appName, appVersion, appDependencies).settings(
      playRunHooks <+= baseDirectory.map(base => Grunt(base / "modules" / "child"))
    ).dependsOn(client).aggregate(client)
}*/
