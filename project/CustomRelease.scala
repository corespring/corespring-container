import org.corespring.sbtrelease.ReleaseSteps._
import org.corespring.sbtrelease.ReleaseExtrasPlugin._
import org.corespring.sbtrelease.{Git, PrefixAndVersion, BranchNameConverter, FolderStyleConverter}
import sbt.Keys._
import sbt._
import sbtrelease.ReleaseStateTransformations._
import sbtrelease.ReleasePlugin.autoImport._
import sbtrelease.Version.Bump
import sbtrelease.Version


/**
  * Whilst testing happens map hotfix and release branches to cr-hotfix/0.0.0 or cr-release/0.0.0
  */
private object HyphenNameConverter extends BranchNameConverter {
  val pattern = """^([^-]+)-([^-]+)$""".r

  override def fromBranchName(branchName: String): Option[PrefixAndVersion] = try {
    val pattern(prefix, versionString) = branchName
    Version(versionString).map {
      PrefixAndVersion(prefix, _)
    }
  } catch {
    case t: Throwable => None
  }

  override def toBranchName(pf: PrefixAndVersion): String = s"${pf.prefix}-${pf.version.withoutQualifier.string}"
}

object CustomRelease {

  lazy val logReleaseVersion = ReleaseStep(action = (st: State) => {
    val extracted = Project.extract(st)
    st.log.info(">>> version now set to: ${extracted.get(version)}")
    st
  })

  lazy val buildTgz = ReleaseStep(action = (st: State) => {
    val extracted = Project.extract(st)
    import com.typesafe.sbt.SbtNativePackager._
    import com.typesafe.sbt.packager.Keys._
    val (newState, _) = extracted.runTask(packageZipTarball in Universal, st)
    newState
  })


  def unsupportedBranch(b:String) = ReleaseStep(action = st => {
    sys.error(s"Unsupported branch for releasing: $b, must be 'rc' for releases or 'hotfix' for hotfixes")
  })

  lazy val settings = Seq(
    branchNameConverter := HyphenNameConverter,
    releaseVersionBump := Bump.Minor,
    releaseProcess <<= baseDirectory.apply { bd =>

      def shared(branchName:String) = Seq(
        checkBranchName(branchName),
        checkSnapshotDependencies,
        runClean,
        runTest,
        runIntegrationTest,
        prepareReleaseVersion,
        setReleaseVersion,
        commitReleaseVersion)

      val regularRelease = shared("rc") ++ Seq(
        mergeCurrentBranchTo("master"),
        tagBranchWithReleaseTag("master"),
        pushBranchChanges,
        pushTags,
        publishArtifacts)

      val hotfixRelease = shared("hf") ++ Seq(
        tagBranchWithReleaseTag("hf"),
        pushBranchChanges,
        pushTags,
        publishArtifacts)

      Git(bd).currentBranch match {
        case "rc" => regularRelease
        case "hf" => hotfixRelease
        case branch => Seq(unsupportedBranch(branch))
      }
    })

}

