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

  lazy val logReleaseVersion = ReleaseStep(action = (st:State) => {
    val extracted = Project.extract(st)
    st.log.info(">>> version now set to: ${extracted.get(version)}")
    st
  })

  lazy val buildTgz = ReleaseStep(action = (st:State)=> {
    val extracted = Project.extract(st)
    import com.typesafe.sbt.SbtNativePackager._
    import com.typesafe.sbt.packager.Keys._
    val (newState, _) = extracted.runTask(packageZipTarball in Universal, st)
    newState
  })

  lazy val settings = Seq(
    branchNameConverter := HyphenNameConverter,
    releaseVersionBump := Bump.Minor,
    releaseProcess <<= thisProjectRef.apply { ref =>
      Seq(
        checkBranchName("rc"),
        //TODO - ensureVersionEndsWith("-SNAPSHOT")?
//        checkSnapshotDependencies,
//        runClean,
//        runTest,
//        prepareReleaseVersion,
//        setReleaseVersion,
//        commitReleaseVersion,
//        pushBranchChanges,
//        mergeCurrentBranchTo("master"),
//        tagBranchWithReleaseTag("master"),
//        pushBranchChanges,
//        pushTags,
//	      publishArtifacts,
        buildTgz)
    })
}
