import java.net.InetSocketAddress

import laika.sbt.LaikaSbtPlugin.LaikaPlugin
import org.joda.time.DateTime
import org.joda.time.format.DateTimeFormat
import play.Project._
import sbt.Keys._
import sbt._

object Build extends sbt.Build {

  val org = "org.corespring"
  val ScalaVersion = "2.10.3"

  def isWindows = System.getProperty("os.name").toLowerCase().contains("windows")

  val gruntCmd = "node ./node_modules/grunt-cli/bin/grunt"
  val npmCmd = if (isWindows) "npm.cmd" else "npm"
  val bowerCmd = "node ./node_modules/bower/bin/bower"

  object Dependencies {
    val aws = "com.amazonaws" % "aws-java-sdk" % "1.10.0"
    val casbah = "org.mongodb" %% "casbah" % "2.6.3"
    //The closure compiler that play uses - we expect this to be provided by the play app.
    val closureCompiler = ("com.google.javascript" % "closure-compiler" % "rr2079.1")
      .exclude("args4j", "args4j")
      .exclude("org.json", "json")
      .exclude("com.google.protobuf", "protobuf-java")
      .exclude("org.apache.ant", "ant")
      .exclude("com.google.code.findbugs", "jsr305")
      .exclude("com.googlecode.jarjar", "jarjar")
      .exclude("junit", "junit")
    val commonsIo = "commons-io" % "commons-io" % "2.4"
    val commonsLang = "org.apache.commons" % "commons-lang3" % "3.2.1" % "test"
    val dependencyUtils = "org.corespring" %% "dependency-utils" % "0.5"
    val grizzled = "org.clapper" %% "grizzled-scala" % "1.2"
    val grizzledLog = "org.clapper" %% "grizzled-slf4j" % "1.0.2"
    val htmlCleaner = "net.sourceforge.htmlcleaner" % "htmlcleaner" % "2.10"
    val jade4j = "de.neuland-bfi" % "jade4j" % "0.4.2"
    val logbackClassic = "ch.qos.logback" % "logback-classic" % "1.0.7"
    val logbackCore = "ch.qos.logback" % "logback-core" % "1.0.7"
    val mockito = "org.mockito" % "mockito-all" % "1.9.5" % "test"
    val rhinoJs = "org.mozilla" % "rhino" % "1.7.6"
    val playS3 = "org.corespring" %% "s3-play-plugin" % "1.2.0"
    val scalaz = "org.scalaz" %% "scalaz-core" % "7.0.6"
    val specs2 = "org.specs2" %% "specs2" % "2.2.2" % "test"
    val yuiCompressor = "com.yahoo.platform.yui" % "yuicompressor" % "2.4.7"
  }

  object Resolvers {
    val corespringReleases = "Corespring Artifactory Releases" at "http://repository.corespring.org/artifactory/ivy-releases"
    val corespringSnapshots = "Corespring Artifactory Snapshots" at "http://repository.corespring.org/artifactory/ivy-snapshots"
    val eeReleases = "edeustace releases" at "http://edeustace.com/repository/releases/"
    val eeSnapshots = "edeustace snapshots" at "http://edeustace.com/repository/snapshots/"
    var jade4jReleases = "jade4j" at "https://raw.github.com/neuland/jade4j/master/releases"
    val typesafeReleases = "typesafe releases" at "http://repo.typesafe.com/typesafe/releases/"
    val typesafeSnapshots = "typesafe snapshots" at "http://repo.typesafe.com/typesafe/snapshots/"

    val all = Seq(
      corespringSnapshots,
      corespringReleases,
      eeReleases,
      eeSnapshots,
      jade4jReleases,
      typesafeReleases,
      typesafeSnapshots)
  }

  import Build.Dependencies._

  val builder = new Builders(org, ScalaVersion)

  lazy val utils = builder.lib("container-utils")

  val playAppToSbtLibSettings = Seq(
    scalaSource in Compile <<= (baseDirectory in Compile)(_ / "src" / "main" / "scala"),
    scalaSource in Test <<= (baseDirectory in Test)(_ / "src" / "test" / "scala"),
    resourceDirectory in Compile <<= (baseDirectory in Compile)(_ / "src" / "main" / "resources"),
    resourceDirectory in Test <<= (baseDirectory in Test)(_ / "src" / "test" / "resources"),
    lessEntryPoints := Nil,
    javascriptEntryPoints := Nil)

  val buildClient = TaskKey[Unit]("build-client", "runs client installation commands")

  val buildClientTask = buildClient <<= (baseDirectory, streams) map {
    (baseDir, s) =>
      val clientRoot: File = baseDir

      val commands = Seq(
        (npmCmd, "install"),

        /**
         * Note: Adding a bower cache clean to workaround this issue:
         * https://github.com/bower/bower/issues/991
         * Once this is fixed we can remove this
         * (bowerCmd, "cache clean"),
         */
        (bowerCmd, "install"),
        (gruntCmd, "loadComponentDependencies"),
        (gruntCmd, "stage"))

      commands.foreach {
        c =>
          s.log.info(s"[>> $c] on " + clientRoot)
          val (cmd, args) = c
          val exitCode = sbt.Process(s"$cmd $args", clientRoot).!
          if (exitCode != 0) {
            throw new RuntimeException(s"The following commands failed: $c")
          }
      }

  }

  val buildInfo = TaskKey[Unit]("build-client", "runs client installation commands")

  val buildInfoTask = buildInfo <<= (classDirectory in Compile, name, version, streams) map {
    (base, n, v, s) =>

      val propertiesFile = s"${n}-buildInfo.properties"
      s.log.info(s"[buildInfo] ---> write build properties file] on ${base.getAbsolutePath}/$propertiesFile")
      val file = base / propertiesFile
      val commitHash: String = Process("git rev-parse --short HEAD").!!.trim
      val branch: String = Process("git rev-parse --abbrev-ref HEAD").!!.trim
      val formatter = DateTimeFormat.forPattern("HH:mm dd MMMM yyyy");
      val date = formatter.print(DateTime.now)
      val contents = s"""
      commit.hash=$commitHash
      branch=$branch
      version=$v
      date=$date
      s"""
      IO.write(file, contents)
  }

  val runClientTests = TaskKey[Unit]("client-tests", "")

  val runClientTestsTask = runClientTests <<= (baseDirectory, streams) map {
    (baseDir, s) =>
      s.log.info("run client tests")

      sbt.Process(s"$npmCmd install", baseDir) !;
      val result = sbt.Process(s"$gruntCmd test", baseDir) !;
      if (result != 0) {
        throw new RuntimeException("Tests Failed")
      }
  }

  lazy val logging = builder.lib("logging").settings(
    libraryDependencies ++= Seq(grizzledLog))

  lazy val containerClient = builder.clientSideLib("container-client")
    .settings(
      buildClientTask,
      runClientTestsTask,
      (test in Test) <<= (test in Test) dependsOn runClientTests,
      //This task is called by the play stage task
      (packagedArtifacts) <<= (packagedArtifacts) dependsOn buildClient)

  //Note: As above...
  lazy val componentModel = builder.playApp("component-model")
    .settings(playAppToSbtLibSettings: _*)
    .settings(
      libraryDependencies ++= Seq(dependencyUtils))
    .dependsOn(logging, utils % "test->compile;compile->compile")

  //Note: this is a play app for now until we move to play 2.2.0
  lazy val jsProcessing = builder.playApp("js-processing")
    .settings(playAppToSbtLibSettings: _*)
    .settings(
      libraryDependencies ++= Seq(rhinoJs, grizzledLog))
    .dependsOn(logging, containerClient, componentModel % "test->test;compile->compile")

  lazy val componentLoader = builder.lib("component-loader")
    .settings(
      libraryDependencies ++= Seq(logbackClassic, specs2, rhinoJs, commonsLang, commonsIo))
    .dependsOn(logging, componentModel, jsProcessing)

  val containerClientWeb = builder.playApp("container-client-web")
    .settings(
      buildInfoTask,
      (packagedArtifacts) <<= (packagedArtifacts) dependsOn buildInfo,
      sbt.Keys.fork in Test := false,
      sources in doc in Compile := List(),
      libraryDependencies ++= Seq(
        mockito,
        grizzled,
        htmlCleaner,
        scalaz,
        jade4j,
        closureCompiler,
        yuiCompressor,
        commonsIo,
        aws),
      templatesImport ++= Seq("play.api.libs.json.JsValue", "play.api.libs.json.Json"))
    .dependsOn(
      componentModel % "compile->compile;test->test",
      containerClient,
      utils,
      logging,
      jsProcessing)

  val mongoJsonService = builder.playApp("mongo-json-service")
    .settings(playAppToSbtLibSettings: _*)
    .settings(libraryDependencies ++= Seq(casbah, mockito))
    .dependsOn(logging)

  val docs = builder.playApp("docs")
    .settings(LaikaPlugin.defaults: _*)
    .settings(
      unmanagedResourceDirectories in Compile += target.value / "docs",
      compile in Compile := {
        import laika.sbt.LaikaSbtPlugin.LaikaKeys._
        (site in Laika).value
        (compile in Compile).value
      } //(compile in Compile).dependsOn(laika.sbt.LaikaSbtPlugin.LaikaKeys.site)
      )

  val shell = builder.playApp("shell")
    .settings(
      libraryDependencies ++= Seq(logbackClassic, casbah, playS3, scalaz, play.Keys.cache, yuiCompressor, closureCompiler, commonsIo))
    .dependsOn(containerClientWeb, componentLoader, mongoJsonService, docs, logging)
    .aggregate(containerClientWeb, componentLoader, containerClient, componentModel, utils, jsProcessing, mongoJsonService, docs, logging)

  val root = builder.playApp("root", Some("."))
    .settings(
      shellPrompt := ShellPrompt.buildShellPrompt,
      (resolvers in ThisBuild) ++= Resolvers.all,
      sbt.Keys.fork in Test := false,
      //lock java and javac to 1.7
      (javacOptions in Compile) ++= Seq("-source", "1.7", "-target", "1.7"),
      // Start grunt on play run
      playOnStarted <+= baseDirectory {
        base =>
          (address: InetSocketAddress) => {
            Grunt.process = Some(Process(s"$gruntCmd run", (base / "modules" / "container-client")).run)
          }: Unit
      },
      // Stop grunt when play run stops
      playOnStopped += {
        () =>
          {
            Grunt.process.map(p => p.destroy())
            Grunt.process = None
          }: Unit
      },
      commands <++= baseDirectory {
        base =>
          val clientDir = base / "modules" / "container-client"
          val componentsDir = base / "corespring-components"
          Seq(
            cmd("grunt", "./node_modules/grunt-cli/bin/grunt", s"$clientDir\\cmds\\grunt.cmd", Seq(clientDir)),
            cmd("bower", "./node_modules/bower/bin/bower", s"$clientDir\\cmds\\bower.cmd", Seq(clientDir, componentsDir)),
            cmd("npm", "npm", "npm.cmd", Seq(clientDir, componentsDir)))
      })
    .settings(CustomRelease.settings)
    .dependsOn(shell)
    .aggregate(shell)

  private def cmd(name: String, unixCmd: String, windowsCmd: String, bases: Seq[File]): Command =
    Command.args(name, "<" + name + "-command>") {
      (state, args) =>
        val cmd = if (isWindows) windowsCmd else unixCmd
        bases.map { base =>
          val exitCode = Process(cmd :: args.toList, base) !;
          if (exitCode != 0) {
            throw new RuntimeException(s"${name}, ${base.getPath} returned a non zero exit code")
          }
          state
        }.head
    }

  object Grunt {
    var process: Option[Process] = None
  }

}
