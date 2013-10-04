## Container Client

The client side app for the corespring container.

This app is client-side only project. **There is no server side logic in this project.**

## Using

### Player

#### config.json
To configure the player, the server needs to implement the 'GET config.json' call.

In this call you need to return the following:

```json
    {
      "xhtml" : "some html",
      "angular" : {
        // an array of modules that the app should depend on.
        "dependencies" : [],
      },
      // an array of scripts that the page should load
      "scripts" : []
    }
```

On receipt of this the player will add the xhtml to the dom, load the scripts and once all the scripts are loaded
initialize the angular app with the dependencies that you declared (plus its own default dependencies).

#### provide an implementation for 'PlayerServices'

The player depends on an angular service called 'PlayerServices'. This service provides the api to load and save data
in and out of the player. Its api looks like so:

    ```javascript
    {
      /**
       * Submit answers to the server
       * @param answers - the answers object
       * @param onSuccess - a callback that takes the answer response object as its first parameter
       * @param onFailure - a callback that takes the error object as its first parameter
       */
      submitAnswers: function(answers, onSuccess, onFailure){...},
      /**
       * Load the session for the player
       * @param onSuccess - a callback that takes the session object as its first parameter
       * @param onFailure - a callback that takes the error object as its first parameter
       */
      loadSession: function(onSuccess, onFailure){...}
    }
    ```


