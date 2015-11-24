addSbtPlugin("com.github.gseitz" % "sbt-release" % "0.8")

credentials += Credentials(Path.userHome / ".ivy2"/".credentials")
resolvers += "corespring-ivy-releases" at "http://repository.corespring.org/artifactory/ivy-releases"
addSbtPlugin("org.corespring" % "sbt-release-extras" % "1.3.0")
