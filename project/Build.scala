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
    val logbackClassic = "ch.qos.logback" % "logback-classic" % "1.0.7"
    val logbackCore = "ch.qos.logback" % "logback-core" % "1.0.7"
    val rhinoJs = "org.mozilla" % "rhino" % "1.7R4"
    val casbah = "org.mongodb" %% "casbah" % "2.6.3"
    val playS3 = "org.corespring" %% "play-s3" % "0.1-bea81d9"
    val mockito = "org.mockito" % "mockito-all" % "1.9.5" % "test"
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

  lazy val utils = builder.lib("container-utils")

  val playAppToSbtLibSettings = Seq(
    scalaSource in Compile <<= (baseDirectory in Compile)(_ / "src"/ "main"/ "scala"),
    scalaSource in Test <<= (baseDirectory in Test)(_ / "src" / "test"/ "scala"),
    resourceDirectory in Compile <<= (baseDirectory in Compile)(_ / "src" / "main" / "resources"),
    resourceDirectory in Test <<= (baseDirectory in Test)(_ / "src" / "test" / "resources"),
    lessEntryPoints := Nil,
    javascriptEntryPoints := Nil
  )

  val buildClient = TaskKey[Unit]("build-client", "runs client installation commands")

  val buildClientTask = buildClient <<= (baseDirectory, streams) map {
    (baseDir, s) =>
      val clientRoot : File = baseDir
      s.log.info("[>> npm install] on " + clientRoot )
      sbt.Process("npm install", clientRoot) !;
      s.log.info("[>> bower install] on " + clientRoot )
      sbt.Process("bower install", clientRoot) !;
      s.log.info("[>> grunt] on " + clientRoot )
      sbt.Process("grunt --devMode=false", clientRoot) !;
  }

  val runClientTests = TaskKey[Unit]("client-tests", "")

  val runClientTestsTask = runClientTests <<= (baseDirectory, streams) map {
    (baseDir, s) =>
      s.log.info("run client tests")
      sbt.Process("npm install", baseDir) !;
      val result = sbt.Process("grunt test", baseDir) !;
      if(result != 0){
        throw new RuntimeException("Tests Failed")
      }
  }

  lazy val containerClient = builder.lib("container-client")
    .settings(
    buildClientTask,
    runClientTestsTask,
    (test in Test) <<= (test in Test) dependsOn runClientTests,
    //This task is called by the play stage task
    (packagedArtifacts) <<= (packagedArtifacts) dependsOn buildClient
  )

  //Note: this is a play app for now until we move to play 2.2.0
  lazy val jsProcessing = builder.playApp("js-processing").settings( playAppToSbtLibSettings : _* ).settings(
    libraryDependencies ++= Seq(rhinoJs)
  ).dependsOn(containerClient)

  //Note: As above...
  lazy val componentModel = builder.playApp("component-model").settings(playAppToSbtLibSettings: _*).settings(
    libraryDependencies ++= Seq(specs2),
    resolvers ++= Resolvers.all
  ).dependsOn(utils % "test->compile;compile->compile", jsProcessing)

  lazy val componentLoader = builder.lib("component-loader")
    .settings(
    libraryDependencies ++= Seq(logbackClassic, specs2, rhinoJs)
  ).dependsOn(componentModel, jsProcessing)


  val containerClientWeb = builder.playApp("container-client-web").settings(
    sources in doc in Compile := List(),
    libraryDependencies ++= Seq(mockito),
    templatesImport ++= Seq( "play.api.libs.json.JsValue", "play.api.libs.json.Json" )
  ).dependsOn(
    componentModel % "compile->compile;test->test",
    containerClient,
    utils,
    jsProcessing)

  val shell = builder.playApp("shell", Some(".")).settings(
    resolvers ++= Resolvers.all,
    libraryDependencies ++= Seq(casbah, playS3),
    credentials += cred,
    sbt.Keys.fork in Test := false,
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
    .aggregate(containerClientWeb, componentLoader, containerClient, componentModel, utils, jsProcessing)

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
