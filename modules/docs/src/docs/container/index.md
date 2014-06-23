# Container

The container is a play module that honors the [Component Spec].

### Sbt installation

    play.Project("blah").settings(
        libraryDependencies ++= Seq( "org.corespring" %% "container-client-web" % "X.X.X")
    )

## Integrating the player/editor

Once you have the `container-client-web` on your classpath, you'll need to integrate it with your application.

### Securing the Container

The container doesn't have any security built in. Instead the implementing application is expected to add their own 
security when implementing the integration points known as 'hooks'.

### Overview 

The simplest example of an integration is the `shell` module within the app. Have a look at `ContainerClientImplementation`.

This class extends `DefaultIntegration`, which is a trait that provides as many default implementations for you.

For most cases, you can extend this trait and implement its methods.

## Implementing the hooks

Once you extend `DefaultIntegration` it will ask for implementations for the `*Hooks` traits. These traits are called
 within the controllers and allows the calls to be checked by the implementing application.

The general pattern is: 

    def doThing(params:....)(implicit header : RequestHeader) : Future[Either[(Int,String),DataNeededByController]]

Where the `Left` is an `(Int,String)` representing a status code + message and `Right` represents whatever the 
controller needs.


![integration](../img/integration.png)

### Example: ItemController

For example lets consider loading an Item. For this the library creates a controller:

    trait ItemController {

        def hooks : ItemHooks

        def load(id:String) = Action.async{ implicit request => 
         
         hooks.load(id){ either => either match {
           case Left((code,msg)) => Status(code)(msg)
           case Right(data) => Ok(....)
          }
        }
    }

The controller contains an `ItemActions` trait:

    trait ItemHooks{
        def load(id:String)(implicit header : RequestHeader ) : Future[Either[(Int,String),JsValue]]
    }

By implementing `ItemHookss` the containing app can plugin any integration points, for example a dao:

    class AppItemHooks extends ItemHooks{
        override def load(id:String)(implicit header : RequestHeader ) = Future{
            ItemDao.load(id).map{ item =>
                //call the block passed in from the ItemController
                Right(item)
            }.getOrElse(Left(NOT_FOUND,s"Can't find item with id $id")
        }
    }

This implementation will the be used by the controller implementation:

    class AppItemController extends ItemController{
        override def hooks = new AppItemHooks()
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


## Running the Editor client in with Developer js or Production js mode

If you want to run the editor client with all the sources unminified and exploded you can add `mode=dev` to the editor url - for example: 

    http://myapp/cs-editor/editor/3333/index.html?jsMode=dev

If you are developing the container it defaults to dev mode when you run `play run`. If you wish to see the prod scripts add `mode=prod` to the url - for example:  

    http://myapp/cs-editor/editor/3333/index.html?jsMode=prod