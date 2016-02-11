package org.corespring.container.client.controllers.apps

case class ContextAndSuffix(context: String, suffix: String)

trait SourcePathsService {
  def load[A <: SourcePaths](contextAndSuffix: ContextAndSuffix, load: String => A): A
}

import play.api.Logger

import scala.collection.mutable

class JsonReportSourcePathsService(reload: Boolean = false) extends SourcePathsService {

  private val logger = Logger(classOf[JsonReportSourcePathsService])

  private val reports: mutable.Map[ContextAndSuffix, SourcePaths] = mutable.Map.empty

  def reportName(contextAndSuffix: ContextAndSuffix): String = {
    val suffix = contextAndSuffix.suffix
    val context = contextAndSuffix.context
    val out = s"container-client/$context-$suffix-report.json"
    logger.debug(s"function=reportName, contextAndSuffix=$contextAndSuffix, out=$out")
    out
  }

  override def load[A <: SourcePaths](contextAndSuffix: ContextAndSuffix, load: (String) => A): A = {
    logger.info(s"function=load, contextAndSuffix=$contextAndSuffix")
    (reports.get(contextAndSuffix), reload) match {
      case (Some(sp), false) => sp.asInstanceOf[A]
      case _ => {
        val path = reportName(contextAndSuffix)
        val report = load(path)
        reports.put(contextAndSuffix, report)
        report
      }
    }
  }
}
