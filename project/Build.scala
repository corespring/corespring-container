import sbt.Keys._
import sbt._
import scala.Some

object Build extends sbt.Build {

  val appVersion = "0.0.1"
  val org = "org.corespring"
  val ScalaVersion = "2.10.2"

  object Dependencies {
    val playJson = "com.typesafe.play" %% "play-json" % "2.2.0"
    val specs2 = "org.specs2" %% "specs2" % "2.2.2" % "test"
    val logback = "ch.qos.logback" % "logback-classic" % "1.0.13"
    val rhinoJs = "org.mozilla" % "rhino" % "1.7R4"
    val casbah = "org.mongodb" %% "casbah" % "2.6.3"
  }

  object Resolvers {

    val typesafeReleases = "typesafe releases" at "http://repo.typesafe.com/typesafe/releases/"
    val typesafeSnapshots = "typesafe snapshots" at "http://repo.typesafe.com/typesafe/snapshots/"
    val all = Seq(typesafeReleases, typesafeSnapshots)
  }

  import Dependencies._

  val builder = new Builders(org, appVersion, ScalaVersion)


  lazy val coffeescriptCompiler = builder.lib("coffeescript-compiler").settings(
      libraryDependencies ++= Seq(rhinoJs, specs2)
  )

  lazy val componentModel = builder.lib("component-model").settings(
    libraryDependencies ++= Seq(playJson, specs2),
    resolvers ++= Resolvers.all
  )

  lazy val componentLoader = builder.lib("component-loader")
    .settings(
      libraryDependencies ++= Seq(logback, specs2)
  ).dependsOn(componentModel, coffeescriptCompiler)

  lazy val playerClient = builder.lib("player-client")

  val playerWeb = builder.playApp("player-web")
    .dependsOn(componentModel, playerClient)

  val shell = builder.playApp("shell", Some(".")).settings(
    resolvers ++= Resolvers.all,
    libraryDependencies ++= Seq(casbah)
  )
    .dependsOn(playerWeb, componentLoader)
    .aggregate(playerWeb, componentLoader)

}
