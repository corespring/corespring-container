import java.net.InetSocketAddress
import sbt.inc.Analysis
import sbt.Keys._
import sbt._
import sbt.ScalaVersion
import scala.Some
import play.Project._
import scala.Some

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

    val corespringSnapshots = "Corespring Artifactory Snapshots" at "http://repository.corespring.org/artifactory/ivy-snapshots"
    val corespringReleases = "Corespring Artifactory Releases" at "http://repository.corespring.org/artifactory/ivy-releases"
    val typesafeReleases = "typesafe releases" at "http://repo.typesafe.com/typesafe/releases/"
    val typesafeSnapshots = "typesafe snapshots" at "http://repo.typesafe.com/typesafe/snapshots/"
    val all = Seq(corespringSnapshots, corespringReleases, typesafeReleases, typesafeSnapshots)
  }


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


  val buildClient = TaskKey[Unit]("build-client", "runs client installation commands")

  val buildClientTask = buildClient <<= (baseDirectory, streams) map {
    (baseDir, s) =>
      val clientRoot : File = baseDir
      s.log.info("[running bower install] on " + clientRoot )
      sbt.Process("bower install", clientRoot) !;
      s.log.info("[compile less w/ grunt] on " + clientRoot )
      sbt.Process("npm install", clientRoot) !;
      sbt.Process("grunt less", clientRoot) !;
  }

  lazy val containerClient = builder.lib("container-client")
    .settings(
    sbt.Keys.fork in packagedArtifacts := false,
    buildClientTask,
    //This task is called by the play stage task
    (packagedArtifacts) <<= (packagedArtifacts) dependsOn buildClient
  )

  val containerClientWeb = builder.playApp("container-client-web").settings(
    sources in doc in Compile := List()
  ).dependsOn(componentModel, containerClient )

  val shell = builder.playApp("shell", Some(".")).settings(
    resolvers ++= Resolvers.all,
    libraryDependencies ++= Seq(casbah, playS3),
    credentials += cred,
    sbt.Keys.fork in packagedArtifacts := false,
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
    .aggregate(containerClientWeb, componentLoader, containerClient, coffeescriptCompiler, componentModel)

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
