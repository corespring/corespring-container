import java.net.InetSocketAddress
import sbt.inc.Analysis
import sbt.Keys._
import sbt._
import sbt.ScalaVersion
import sbtrelease.ReleasePlugin._
import scala.Some
import play.Project._


object Build extends sbt.Build {

  val org = "org.corespring"
  val ScalaVersion = "2.10.3"

  object Dependencies {
    val specs2 = "org.specs2" %% "specs2" % "2.2.2" % "test"
    val logbackClassic = "ch.qos.logback" % "logback-classic" % "1.0.7"
    val logbackCore = "ch.qos.logback" % "logback-core" % "1.0.7"
    val rhinoJs = "org.mozilla" % "rhino" % "1.7R4"
    val casbah = "org.mongodb" %% "casbah" % "2.6.3"
    val playS3 = "org.corespring" %% "play-s3" % "0.2-35dbed6"
    val mockito = "org.mockito" % "mockito-all" % "1.9.5" % "test"
    val grizzled = "org.clapper" %% "grizzled-scala" % "1.1.4"
    val scalaz = "org.scalaz" %% "scalaz-core" % "7.0.5"
    val htmlCleaner = "net.sourceforge.htmlcleaner" % "htmlcleaner" % "2.6.1"
  }

  object Resolvers {

    val corespringSnapshots = "Corespring Artifactory Snapshots" at "http://repository.corespring.org/artifactory/ivy-snapshots"
    val corespringReleases = "Corespring Artifactory Releases" at "http://repository.corespring.org/artifactory/ivy-releases"
    val typesafeReleases = "typesafe releases" at "http://repo.typesafe.com/typesafe/releases/"
    val typesafeSnapshots = "typesafe snapshots" at "http://repo.typesafe.com/typesafe/snapshots/"
    val all = Seq(corespringSnapshots, corespringReleases, typesafeReleases, typesafeSnapshots)
  }

  import Dependencies._

  val builder = new Builders(org, ScalaVersion)

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
      //Note: Adding a bower cache clean to workaround this issue: https://github.com/bower/bower/issues/991
      //Once this is fixed we can remove this
      val commands = Seq("npm install", "bower cache clean", "bower install", "grunt --devMode=false")

      commands.foreach{ c =>
        s.log.info(s"[>> $c] on " + clientRoot )
        val exitCode = sbt.Process(c, clientRoot).!
        if(exitCode != 0) {
            throw new RuntimeException(s"The following commands failed: $c")
        }
      }

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
  lazy val jsProcessing = builder.playApp("js-processing")
  .settings(playAppToSbtLibSettings : _*)
  .settings(
    libraryDependencies ++= Seq(rhinoJs)
  ).dependsOn(containerClient)

  //Note: As above...
  lazy val componentModel = builder.playApp("component-model")
  .settings(playAppToSbtLibSettings: _*)
  .settings(
    libraryDependencies ++= Seq(specs2),
    resolvers ++= Resolvers.all
  ).dependsOn(utils % "test->compile;compile->compile", jsProcessing)

  lazy val componentLoader = builder.lib("component-loader")
    .settings(
      libraryDependencies ++= Seq(logbackClassic, specs2, rhinoJs)
    ).dependsOn(componentModel, jsProcessing)


  val containerClientWeb = builder.playApp("container-client-web")
    .settings(
      sources in doc in Compile := List(),
      libraryDependencies ++= Seq(mockito, grizzled, htmlCleaner),
      templatesImport ++= Seq( "play.api.libs.json.JsValue", "play.api.libs.json.Json" )
    ).dependsOn(
      componentModel % "compile->compile;test->test",
      containerClient,
      utils,
      jsProcessing)


  val mongoJsonService = builder.playApp("mongo-json-service")
    .settings(playAppToSbtLibSettings: _*).settings(
      libraryDependencies ++= Seq(casbah)
    )


  val shell = builder.playApp("shell", Some("."))
    .settings(
      resolvers ++= Resolvers.all,
      libraryDependencies ++= Seq(casbah, playS3, scalaz),
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
  ).dependsOn(containerClientWeb, componentLoader, mongoJsonService)
    .aggregate(containerClientWeb, componentLoader, containerClient, componentModel, utils, jsProcessing, mongoJsonService)

  private def cmd(name: String, base: File): Command = {
    Command.args(name, "<" + name + "-command>") { (state, args) =>
      val exitCode = Process(name :: args.toList, base) !;
      if(exitCode != 0){
        throw new RuntimeException(s"$name, ${base.getPath} returned a non zero exit code")
      }
      state
    }
  }

  object Grunt {
    var process: Option[Process] = None
  }
}
