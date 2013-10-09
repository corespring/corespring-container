import java.net.InetSocketAddress
import sbt.Keys._
import sbt._
import scala.Some
import play.Project._

object Build extends sbt.Build {

  val appVersion = "0.0.1"
  val org = "org.corespring"
  val ScalaVersion = "2.10.2"

  object Dependencies {
    val specs2 = "org.specs2" %% "specs2" % "2.2.2" % "test"
    val logback = "ch.qos.logback" % "logback-classic" % "1.0.13"
    val rhinoJs = "org.mozilla" % "rhino" % "1.7R4"
    val casbah = "org.mongodb" %% "casbah" % "2.6.3"
    val playS3 = "org.corespring" %% "play-s3" % "0.1-bea81d9"
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

  //Note: This should be a lib - but I'm having an issue with conflicting play-json libs
  //So making it a play app for now
  lazy val componentModel = builder.playApp("component-model").settings(
    libraryDependencies ++= Seq(specs2),
    resolvers ++= Resolvers.all
  )

  lazy val componentLoader = builder.lib("component-loader")
    .settings(
      libraryDependencies ++= Seq(logback, specs2)
  ).dependsOn(componentModel, coffeescriptCompiler)

  lazy val containerClient = builder.lib("container-client")

  val containerClientWeb = builder.playApp("container-client-web")
    .dependsOn(componentModel, containerClient)

  val shell = builder.playApp("shell", Some(".")).settings(
    resolvers ++= Resolvers.all,
    libraryDependencies ++= Seq(casbah, playS3),
    // Start grunt on play run
    playOnStarted <+= baseDirectory { base =>
      (address: InetSocketAddress) => {
        Grunt.process = Some(Process("grunt run", (base/ "modules"/"container-client")).run)
      }: Unit
    },

    // Stop grunt when play run stops
    playOnStopped += {
      () => {
        Grunt.process.map(p => p.destroy())
        Grunt.process = None
      }: Unit
    },
    commands <++= baseDirectory { base =>
      Seq(
        "grunt",
        "bower",
        "npm"
      ).map(cmd(_, (base/"modules"/"container-client")))
    }
  ).dependsOn(containerClientWeb, componentLoader)
    .aggregate(containerClientWeb, componentLoader, coffeescriptCompiler, componentModel, containerClient)

  private def cmd(name: String, base: File): Command = {
    Command.args(name, "<" + name + "-command>") { (state, args) =>
      Process(name :: args.toList, base) !;
      state
    }
  }

  object Grunt {
    var process: Option[Process] = None
  }
}
