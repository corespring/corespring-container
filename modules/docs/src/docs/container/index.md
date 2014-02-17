# Container


## Integrating the player/editor

The player and editor are designed for use within an external application.

This means that the external application needs to provide integration points to that the editor/player can load and save items

The simplest example of an integration is the `shell` module within the app. Have a look at `ContainerClientImplementation`.

Note: I hope to simplify how one can integrate by providing more sensible defaults.


### component-sets controller

This controller loads js and css for components. What to load is part of the url of the form:

    org[comp1,comp2,...]+org2[comp1,comp2,...]

Or if you want to load all the components for an org you can call:

    org[all]


This provides a simple uri that may be cached by the external app.

#### JS/Css processing

TODO: how to minify/gzip?