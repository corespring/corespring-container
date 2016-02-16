package org.corespring.container.client.controllers.apps

import org.corespring.container.client.HasContainerContext
import org.corespring.container.client.component.{ ComponentScriptPrep, ComponentUrls, ItemTypeReader }
import org.corespring.container.client.controllers.helpers.{ Helpers, LoadClientSideDependencies }
import org.corespring.container.client.hooks.Hooks.StatusMessage
import org.corespring.container.components.model.dependencies.DependencyResolver
import play.api.Mode.Mode
import play.api.mvc._

import scala.concurrent._

trait App[T]
  extends Controller
  with DependencyResolver
  with Helpers
  with LoadClientSideDependencies
  with HasContainerContext
  with ComponentScriptPrep {
  self: ItemTypeReader =>

  def mode: Mode

  def showErrorInUi(implicit rh: RequestHeader): Boolean = jsMode(rh) == "dev"

  def context: String

  def urls: ComponentUrls

  def hooks: T

  object handleSuccess {

    def apply[D](fn: (D) => SimpleResult)(e: Either[StatusMessage, D]): SimpleResult = e match {
      case Left((code, msg)) => Status(code)(msg)
      case Right(s) => fn(s)
    }

    def async[D](fn: (D) => Future[SimpleResult])(e: Either[StatusMessage, D]): Future[SimpleResult] = e match {
      case Left((code, msg)) => Future { Status(code)(msg) }
      case Right(s) => fn(s)
    }

  }

}

