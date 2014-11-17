import sbt._
import Keys._
import play.Project._
import sbtrelease.ReleasePlugin._
import sbtrelease.Version

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
    //By default always bump the minor for a release
    ReleaseKeys.versionBump := Version.Bump.Minor,
    credentials += cred,
    Keys.fork in Test := false,
    Keys.parallelExecution in Test := false,
    scalaVersion := rootScalaVersion,
    publishTo <<= version {
      (v: String) =>
        def isSnapshot = v.trim.contains("-")
        val base = "http://repository.corespring.org/artifactory"
        val repoType = if (isSnapshot) "snapshot" else "release"
        val finalPath = base + "/ivy-" + repoType + "s"
        Some("Artifactory Realm" at finalPath)
    })

  def lib(name: String, rootFile: Option[String] = None) = {
    val root = file(rootFile.getOrElse(s"modules/$name"))
    sbt.Project(name, root)
      .settings(organization := org, scalaVersion := rootScalaVersion)
      .settings(sharedSettings: _*)
  }

  def playApp(name: String, rootFile: Option[String] = None) = lib(name, rootFile).settings(playScalaSettings: _*)

  private val copyToNamedDir = TaskKey[Seq[(File, File)]]("custom-copy-resources", "custom copy")

  private val copyToNamedDirTask = copyToNamedDir <<=
    (name, (classDirectory in Compile), cacheDirectory, (resources in Compile), (resourceDirectories in Compile), streams) map { (n, target, cache, resrcs, dirs, s) =>
      val namedTarget = target / n
      val cacheFile = cache / "copy-resources" //  / n
      s.log.debug("named target " + namedTarget.toString)
      val mappings = (resrcs --- dirs) pair (rebase(dirs, namedTarget) | flat(namedTarget))
      s.log.debug("Copy resource mappings: " + mappings.mkString("\n\t", "\n\t", ""))
      Sync(cacheFile)(mappings)
      mappings
    }

  /**
   * Creates a project suited for client side only code.
   * Creates a 'src' and 'test' directory.
   * When compiling and packaging the src is placed in $classDirectory/$projectName, eg:
   * if you had a project called 'my-project' with:
   * src/
   *   index.js
   *
   *  The output would be:
   *
   * target/scala-2.10/classes/my-project/index.js
   * @param name
   * @param rootFile
   * @return
   */
  def clientSideLib(name: String, rootFile: Option[String] = None) = {
    val root = file(rootFile.getOrElse(s"modules/$name"))
    sbt.Project(name, root)
      .settings(organization := org, scalaVersion := rootScalaVersion)
      .settings(sharedSettings: _*)
      .settings(
        copyToNamedDirTask,
        copyResources in Compile := copyToNamedDir.value,
        unmanagedSourceDirectories in Compile := baseDirectory.value / "src" :: Nil,
        unmanagedSourceDirectories in Test := baseDirectory.value / "test" :: Nil,
        resourceDirectory in Compile := baseDirectory.value / "src",
        resourceDirectory in Test := baseDirectory.value / "test")

  }
}