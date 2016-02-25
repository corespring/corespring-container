package org.corespring.container.client.component

import org.corespring.container.client.controllers.angular.AngularModules
import org.corespring.container.client.controllers.apps.ComponentService
import org.corespring.container.client.controllers.helpers.LoadClientSideDependencies
import org.corespring.container.components.model.{ComponentInfo, Id}
import org.corespring.container.components.model.dependencies.DependencyResolver

trait ComponentBundler {
  def singleBundle(componentType: String, context: String, expandPaths: Boolean): Option[SingleComponentScriptBundle]

  def bundleAll(context:String, scope:Option[String], expandPaths:Boolean) : Option[ComponentsScriptBundle]
  def bundle(ids: Seq[Id], context:String, scope:Option[String], expandPaths:Boolean) : Option[ComponentsScriptBundle]
}

class DefaultComponentBundler(
  dependencyResolver: DependencyResolver,
  clientSideDependencies: LoadClientSideDependencies,
  urls: ComponentUrls,
  componentService:ComponentService)
  extends ComponentBundler {

  override def singleBundle(componentType: String, context: String, expandPaths: Boolean = false): Option[SingleComponentScriptBundle] = {

    dependencyResolver.components.find(_.componentType == componentType).map { c =>
      val resolved = dependencyResolver.resolveComponents(Seq(c.id), Some(context))

      val cd = clientSideDependencies.getClientSideDependencies(resolved)
      val ngModules = new AngularModules().createAngularModules(resolved, cd)
      SingleComponentScriptBundle(
        component = c.asInstanceOf[ComponentInfo],
        urls.jsUrl(context, resolved, expandPaths),
        urls.cssUrl(context, resolved, expandPaths),
        ngModules)
    }
  }

  override def bundle(ids: Seq[Id], context:String, scope:Option[String], expandPaths:Boolean) = {
    val resolved = dependencyResolver.resolveComponents(ids, scope)
    val cd = clientSideDependencies.getClientSideDependencies(resolved)
    val ngModules = new AngularModules().createAngularModules(resolved, cd)
    Some(ComponentsScriptBundle(
      components = resolved,
      urls.jsUrl(context, resolved, expandPaths),
      urls.cssUrl(context, resolved, expandPaths),
      ngModules))

  }

  override def bundleAll(context:String, scope:Option[String], expandPaths:Boolean): Option[ComponentsScriptBundle] = {
    bundle(componentService.components.map(_.id), context, scope, expandPaths)
  }
}
