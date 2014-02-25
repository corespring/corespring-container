# Container

The container is a play module that honors the [Component Spec].

### Sbt installation

    play.Project("blah").settings(
        libraryDependencies ++= Seq( "org.corespring" %% "container-client-web" % "X.X.X")
    )

## Integrating the player/editor

Once you have the `container-client-web` on your classpath, you'll need to integrate it with your application.

The simplest example of an integration is the `shell` module within the app. Have a look at `ContainerClientImplementation`.

This class extends `DefaultIntegration`, which is a trait that provides as many default implementations for you.

For most cases, you can extend this trait and implement its methods.


Integration uses a decorator pattern, to allow clients to decorate the libraries core action logic.

The basic pattern of integration is as follows:

![integration](../img/integration.png)

* In the routes file you define a trait as the destination of a route, by adding a '@' before the fully qualified name.
* Implement the Controller
* Implement the Actions
* Register the Controller implementation as the instance to use for the route


The controller trait contains the controller methods that are exposed in the routes file.

### Example: ItemController

For example lets consider loading an Item. For this the library creates a controller:

    trait ItemController {

        def actions : ItemActions

        def load(id:String)  = actions.load(id){ itemRequest =>
            //item is loaded - do your work..
            Ok(itemRequest.item)
        }
    }

The controller contains an `ItemActions` trait:

    trait ItemActions{
        def load(id:String)(block: ItemRequest => Result) : Action[AnyContent]
    }

By implementing `ItemActions` the containing app can plugin any integration points, for example a dao:

    class AppItemActions extends ItemActions{
        override def load(id:String)(block:ItemRequest=> Result) : Action[AnyContent] = Action { request =>
            ItemDao.load(id).map{ item =>
                //call the block passed in from the ItemController
                block(ItemRequest(item, r))
            }.getOrElse(NotFound(""))
        }
    }

This implementation will the be used by the controller implementation:

    class AppItemController extends ItemController{
        override def actions = new AppItemActions()
    }

### component-sets controller
Finally the implementation needs to be returned by implementing play's `GlobalSettings#getControllerInstance` method.
In the `container-client-web` we provide a trait that implements this: `ControllerInstanceResolver`.
Your implementation of this trait only needs to specify:

    def controllers: Seq[Controller]

The trait will use this seq to look up implementations.

Here's an example:

    object Global extends ControllerInstanceResolver with GlobalSettings {
      //controllers that will be used to lookup implementations
      lazy val controllers: Seq[Controller] = Seq(new AppItemController())
    }


## component-sets controller

This controller loads js and css for components. What to load is part of the url of the form:

    org[comp1,comp2,...]+org2[comp1,comp2,...]

Or if you want to load all the components for an org you can call:

    org[all]


This provides a simple uri that may be cached by the external app.

## JS/Css processing

TODO: how to minify/gzip?