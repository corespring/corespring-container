# Component Spec

There are 4 types of component: [Interaction], [Widget], [Layout] and [Library]

## Interaction
Interactions are ui elements that may require a user response. They consist of client side and server side logic. They are configured with markup and json.

## Widget 

A widget is a ui element that doesn't require any user response. It only has client side logic (because there is nothing to process on the server). They are configured with markup and json. 

## Layout 

Ui elements that can contain other elements, they are client side only. They are only configured in the xhtml (no json config).

For example; Tabs, Carousel, Expanders are all layout components.

The container decides to include the components by inspecting the Item.xhtml property for usage.

## Library
For sharing either client or server side logic amongst components use Libraries.

This spec defines how to create a component that can run within a corespring container.

A component is a self contained unit that defines client side behaviour and server side processing.

On the client side the component must support the following modes:
* render mode - how the client looks/behaves when rendered to the student
* config mode - how the client looks/behaves when used by an item author

On the server side the component must define 1 method `respond` that takes the model, the answer and some settings.

## Folder Structure

The basic folder structure for all components is like so:

    ```bash
        org/
          comp/
            package.json
            src/
              client/
              server/
            test/
              client/
              server/
    ```

## Client

### Render Mode

### Configure Mode

#### register config panel

##### setModel

### Testing

* write your tests in jasmine for the client side and server side
* for the client side you'll need to do a bit more setup depending on the framework you have chosen to use
* run tests using the [test-rig](test-rig)

## Server

### Allowed dependencies

* underscore/lodash


### [Draft] preprocess


    /**
     * Add any extra data to the component model to allow the component to function.
     * As ever - be careful not to supply any data that may give a clue as to what the correct solution might be.
     *  @param the component model
     *  @return a new object with the preprocessed data. This data will be available to the player component under the 'tmp' property.
     */
    preprocess( model ){
      return { blah: "Blah" };
    }


### respond method

    /**
     * @return an object with the following properties:
     *   - correctness: "correct|incorrect|unknown"
     *   - response: an response object for the client side part of your component - typically contains feedback
     *   - score: a value from 0.0 - 1.0
     */
    response(question, answer, settings)
    
### Respond Function

#### Scoring

All components must output a score between 0.0 and 1.0


#### Feedback

### Testing

## Styling Components

### Editor styling

Your component will be viewed in 2 contexts: 
* Editor
* Player

To style how your component appears in the editor you are free to add the appropriate class names to you directives.

In the editor you component may be put inside a placeholder. This place holder will have the class name `component-placeholder`. By default it will `display: block`. 

You can override this by specifying your own css: 

    .component-placeholder.${org}-${name}{
      display: inline;
    }

For example: 

    .component-placeholder.corespring-inline-choice{
      display: inline;
    }



