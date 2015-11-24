addSbtPlugin("com.github.gseitz" % "sbt-release" % "0.8")
resolvers += Resolver.url("corespring-ivy-releases", url("http://repository.corespring.org/artifactory/ivy-releases"))(Resolver.ivyStylePatterns)
addSbtPlugin("org.corespring" % "sbt-release-extras" % "1.2.2")
