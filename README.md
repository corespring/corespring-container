## Corespring Container

A fleshing out of the POC node app (author dog) to run as a scala app.

This will allow integration points into the main corespring-api project.

## Requirements 

These tools should be on your `PATH`:

[Sbt](http://www.scala-sbt.org/0.13.5/docs/Getting-Started/Setup.html)

[Play 2.2.1](http://www.playframework.com/)

[Grunt](http://gruntjs.com/)

[Node and Npm](http://nodejs.org/)

[Bower](http://bower.io/) `npm install -g bower`


## Installing

    git clone --recursive git@github.com:corespring/corespring-container.git

#### Important !!

The command above *should* add the [corespring-components](http://github.com/corespring/corespring-components) as a
submodule. If it doesn't you'll need to add this repo.

    git submodule init
    git submodule update

## Run

### Credentials file

To successfully run sbt/play, you'll need to install the ivy credentials file that will grant you access to repository.corespring.org.

It should be placed here: 

    ~/.ivy2/.credentials
    
Ask one of the others to supply you with it.


### ENV VARS

*  CONTAINER_S3_KEY - mandatory - Amazon s3 key
*  CONTAINER_S3_SECRET - mandatory - Amazon s3 secret
*  CONTAINER_COMPONENTS_PATH - optional - the path to the components library

### LOGGING

There are some logging config files in `conf/logging/*.xml`.

If deploying the shell app to heroku you can change the logger by updating: 

* ENV_LOGGER - relative path to logger file eg: `conf/logging/debug.xml`

#### CONTAINER_COMPONENTS_PATH + Prod mode play apps

Production mode: When setting this path in a Prod mode play application, you must use 
an absolute path. This is because play doesn't guarantee the use of relative paths for
files relative to the application working dir. see: https://github.com/playframework/playframework/issues/2411 for more information.
  
The s3 bucket is set to: corespring-container-test-bucket

The most straightforward way to obtain these keys if you do not have them is to get them from Heroku:

    heroku config --app corespring-container-devt | grep S3

If you do not have access to the Heroku application, please get in touch with someone to give you access.

## Seeding the Database

Ensure that you have Coffeescript installed:

    which coffee

If this returns nothing, you'll need to install it globally with NPM:

    sudo npm install -g coffee-script


Afterwards, install the project modules:

    cd bin
    npm install
    cd ..
    ./bin/seed-db

### Seeding a remote db

    ./bin/seed-db mongodb://some_domain.com:888/db

## Run play app and install client side dependencies

    play
    [shell] npm install # installs the dependencies for the container-client
    [shell] bower install # installs the ui dependenceis for the container-client
    [shell] grunt loadComponentDependencies (or grunt lcd - for conciseness) # loads any 3rd party libs defined by the components
    [shell] run # start the server

## Testing

    play
    
    
    
Then go to [http://localhost:9000](http://localhost:9000)

## Running the Rig

    http://localhost:9000/client/rig/:org.:component/index.html?data=:component-json-file
    
    Eg: 
    http://localhost:9000/client/rig/corespring.multiple-choice/index.html?data=one.json
    


## Grunt integration with Play

* `grunt` `npm` and `bower` are all available as commands within the play console. 
* When you start the play server you trigger the grunt run task. This will set up a watch on the container-client's
client side resources.
