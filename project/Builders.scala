import sbt._
import Keys._
import play.Project._
import sbtrelease.ReleasePlugin._
import sbtrelease.Version
import org.corespring.sbt.repo.RepoAuthPlugin.Keys._

class Builders(org: String, rootScalaVersion: String) {

  Keys.fork in ThisBuild := false

  val sharedSettings = Seq(
    shellPrompt := ShellPrompt.buildShellPrompt,
    Keys.fork in Test := false,
    Keys.parallelExecution in Test := false,
    scalaVersion := rootScalaVersion,
    publishTo := authPublishTo.value)

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
      val cacheFile = cache / "copy-resources"
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