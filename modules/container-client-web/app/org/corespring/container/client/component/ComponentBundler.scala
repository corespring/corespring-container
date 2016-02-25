package org.corespring.container.client.component

import org.corespring.container.client.controllers.angular.AngularModules
import org.corespring.container.client.controllers.helpers.LoadClientSideDependencies
import org.corespring.container.components.model.ComponentInfo
import org.corespring.container.components.model.dependencies.DependencyResolver

trait ComponentBundler {
  def singleBundle(componentType: String, context: String, expandPaths: Boolean): Option[SingleComponentScriptBundle]
}

class DefaultComponentBundler(
  dependencyResolver: DependencyResolver,
  clientSideDependencies: LoadClientSideDependencies,
  urls: ComponentUrls)
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
}
