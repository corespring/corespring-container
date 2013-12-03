## Corespring Container

A fleshing out of the POC node app (author dog) to run as a scala app.

This will allow integration points into the main corespring-api project.


## Requirements 

These tools should be on your `PATH`:

[Play 2.1.3](http://www.playframework.com/)

[Grunt](http://gruntjs.com/)

[Node and Npm](http://nodejs.org/)

[Bower](http://bower.io/)


## Installing

    git clone --recursive git@github.com:corespring/corespring-container.git

## Run

### ENV VARS

*  CONTAINER_S3_KEY - mandatory - Amazon s3 key
*  CONTAINER_S3_SECRET - mandatory - Amazon s3 secret
*  CONTAINER_COMPONENTS_PATH - optional - the path to the components library
  
The s3 bucket is set to: corespring-container-test-bucket

## Seed the db if you need to...
Install npm packages

    cd bin
    npm install
    cd ..
    ./bin/run


## Run play app

    play
    [shell] npm install # installs the dependencies for the container-client
    [shell] bower install # installs the ui dependenceis for the container-client
    [shell] grunt loadComponentDependencies # loads any 3rd party libs defined by the components
    [shell] run # start the server
    
    
Then go to [http://localhost:9000](http://localhost:9000)

## Running the Rig

    http://localhost:9000/client/rig/:org/:component/index.html?data=:component-json-file
    
    Eg: 
    http://localhost:9000/client/rig/corespring/multiple-choice/index.html?data=one.json
    
    

## Grunt integration with Play

* `grunt` `npm` and `bower` are all available as commands within the play console. 
* When you start the play server you trigger the grunt run task. This will set up a watch on the container-client's client side resources.


