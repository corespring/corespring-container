# Component issues

## Introduction

We need a way to release corespring components so that we have confidence that the component is going to work well within the container.

## Current problems

* Components are loaded from the file system from a git submodule - this makes it easy to accidentally change something and break the container.
* The components don't have their own build, so dependent projects are running builds for them.
* client side js - it's non-standard - what can we do about that?
* there is no way to effectively test the ui of the component

## Goals

each released component:

* should have a semantic version number
* should contain the compiled, ready for action source (eg: minified, gzipped etc)
* should specify which component spec its supposed to work for
* should specify it's dependencies

the containing application should:

* load the component so that it's client side js can be served and server side js is executable
* load the player and load the relevant component source
* provide endpoints for the player to do its work (like load-outcome, score, etc)

### Near term solutions

For near term solutions - I think we need to just build corespring-components as a complete package.

### Publish as .jar

#### pros

* can hook jar into sbt/ivy dependency management
* can be certain that the release is same for container/cs-api
* allows a build and a release to be created

#### cons

* compile time dependency
* we'll need to read in the contents from the jar


### Publish as play module

#### pros

* can have it's own routes
* allows a build and a release to be created

#### cons

* to use the routes the container will need to know about the components in the main routes file


### Publish as submodule

What we currently do and are looking to move on from

### Publish as node lib

#### pros

* would allow us to create a release
* could use the same file reading logic that we have currently

#### cons
* would need to install comps twice - in container and in cs-api (same as we do now)
* we'd prob want to make the release private, may need extra infrastructure for that

### Publish as db source

#### pros

* runtime dependency - can rollback/forwards without a deploy

#### cons

* would need logic to ensure compatibility, parsing etc..
* not a natural fit for what is effectively a bunch of source files


## Medium/Long term solutions

For later stages we may want to consider doing releases of individual components

### Compile time vs runtime dependency

At some point we may want people to create their own components. It would make sense to allow these components to be added/removed/updated at runtime.

The container would need to track what components are installed, and what can be used in the player.

### Dependency management

We should make dependency management as standard as possible.

### node/npm

Using node/npm would be ideal, because its standard and familiar.

However we'd probably want the packages to be private.

Could we use [sinopia](https://github.com/rlidwka/sinopia)?


### avatar.js

[avatar](https://avatar-js.java.net/) is a node compatible layer for nashorn.

If we have node style components, can we load them and execute them in a node way?

eg:

    var lib = require('corespring-common-lib');

    exports.createOutcome = function(question, response, settings) {
      return lib.createOutcome(question, response, settings);
    }

This would save us from having to mimic `require` etc in our js impl.

There would be some questions about how we configure the load path aka `node_modules` in node-speak.

Also how well does avatar.js work?


###  player as node.js app

If we are thinking about a node layer, should we consider the benefits of running a node app?
