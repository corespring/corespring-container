import sbt._
import sbt.Keys._
import sbtrelease.Version.Bump
import sbtrelease.Version
import sbtrelease.ReleasePlugin.autoImport._
import sbtrelease.ReleaseStateTransformations._
import org.corespring.sbtrelease._
import org.corespring.sbtrelease.ReleaseSteps._
import org.corespring.sbtrelease.ReleaseExtrasPlugin._

/**
 * Whilst testing happens map hotfix and release branches to cr-hotfix/0.0.0 or cr-release/0.0.0
 */
private object HyphenNameConverter extends BranchNameConverter {
  val pattern = """^([^-]+)-([^-]+)$""".r

  override def fromBranchName(branchName: String): Option[PrefixAndVersion] = try {
    val pattern(prefix, versionString) = branchName
    Version(versionString).map { PrefixAndVersion(prefix, _) }
  } catch {
    case t: Throwable => None
  }

  override def toBranchName(pf: PrefixAndVersion): String = s"${pf.prefix}-${pf.version.withoutQualifier.string}"
}

object CustomRelease {
  lazy val settings = Seq(
    branchNameConverter := HyphenNameConverter,
    releaseVersionBump := Bump.Minor,
    releaseProcess <<= thisProjectRef.apply { ref =>
      Seq(
        checkBranchVersion,
        checkSnapshotDependencies,
        runClean,
        runTest,
        prepareReleaseVersion,
        setReleaseVersion,
        commitReleaseVersion,
        mergeCurrentBranchTo("master"),
        tagBranchWithReleaseTag("master"),
        //Note: this requires that you run release with defaults `--with-defaults`
        pushChanges,
        publishArtifacts)
    })
}