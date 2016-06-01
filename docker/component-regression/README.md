# Dockerized regression test runner 
The purpose of this docker container is to run the component regression tests.  
It boots up a corespring-container with a mongo and a fake-s3.   
It configures a virtual framebuffer so that we can run firefox in headless mode.  


## Using selenium-docker for development 
For development it is much faster to use a selenium docker image, which runs selenium
 and a browser inside a docker container. The corespring-container and the db are running
 outside of the docker-container  
 
      #Start container
      play run
       
      #Start selenium docker
      docker run -d -p 4444:4444 selenium/standalone-firefox:2.53.0
       
      #Run your tests
      grunt regression --timeout=30000 --baseUrl="http://[your computer's ip]:9000"
 
+ Note: Because selenium runs inside the docker container, it needs to know the ip address 
 of your computer. Localhost or 127.0.0.1 doesn't work, you have to use the real address like 
 192.168.1.8 
        
   

## Building the runner for CI execution
+ Note: Normally it shouldn't be necessary for a dev to build and run these. However, if you want to debug some problem on CI, it might be useful to build and run it locally.   
         
The runner consists of different parts that you have to build in order.  
 
 1. RegrBase - It contains the infrastructure like mongo 
  
     docker build -t regrbase -f docker/component-regression/dockerfiles/RegrBase .
      
 2. CurrCont - (Dev only) It embeds the current container into the docker.
  
     # the current container is taken from the stage so you have to build it first
     play stage 
     # after you can add it to docker 
     docker build -t currcont -f docker/component-regression/dockerfiles/CurrCont .
     
 3. DevCompRegrRunner - (Dev only) It embeds the current component set and the grunt config for running the regression tests.
        
     docker build -t dcrr -f docker/component-regression/dockerfiles/DevCompRegrRunner .
        
 4. CiCompRegrRunner - It embeds the script to download a slug and run the tests that are inside of the slug
 
     docker build -t cicrr -f docker/component-regression/dockerfiles/CiCompRegrRunner .
 
 For ci you have to build 1 and 4.    
 For debugging & dev you are building 1, 2 and 3. If you change something in the components, you have to rebuild the third part only  
  

### Note: Docker registry and docker container for CI

Our docker registry for the component-regression containers:
    
    468517524622.dkr.ecr.us-east-1.amazonaws.com/corespring-components-regression

The *RegrBase* container can be pulled from (and pushed to)

    468517524622.dkr.ecr.us-east-1.amazonaws.com/corespring-components-regression:base

The *CiCompRegrRunner* container can be pulled from (and pushed to)

    468517524622.dkr.ecr.us-east-1.amazonaws.com/corespring-components-regression:runner

CI automation will tag the above containers according to the steps in `Building the runner` in this documentation, so 
`base` will be tagged as

    docker tag corespring-components-regression:base regrbase:latest

and runner will be tagged as

    docker tag corespring-components-regression:runner cicrr:latest


### Problems
+ Sometimes npm install doesn't work. If possible, try running npm install in the regression directory of your source files before running the docker build.      
       
## Running the regression tests 
     
     docker run -e SLUG="http://myslug.tgz" cicrr
        
### Options 
     -e SLUG="http://my-slug.tgz"      ## mandatory, see 'get slug url' below
   
     -e BROWSER_NAME="firefox"          ## optional, default firefox, chrome is the only other possible value
     -e GREP="some text"               ## optional, no default, use it to select tests
     -e INVERT_GREP="true"             ## optional, default is false, inverts the grep 
     -e GRUNT_DEBUG "false"            ## optional, default is false
     -e TIMEOUT=milliseconds           ## optional, default 30000
     -e WAIT_BEFORE_TEST=seconds       ## optional, default 30, increase if you tests fail to connect to localhost
     -e WEB_DRIVER_LOG_LEVEL "silent"  ## optional, default silent, other values: verbose|command|data|result, see: [webdriver docs](http://webdriver.io/guide/getstarted/configuration.html)
        
## Getting the slug url 

If you have a slug id "74f625e6-13af-4126-b83a-48521b6992fa" from the ci build you can use this curl to get the infor about the slug  
 
     curl -n https://api.heroku.com/apps/corespring-container-devt/slugs/74f625e6-13af-4126-b83a-48521b6992fa -H "Accept: application/vnd.heroku+json; version=3"
     
That returns some json which contains the download url 
 
     {
       "blob":{
         "method":"get",
         "url":"https://s3-external-1.amazonaws.com/herokuslugs/heroku.com/v1/74f625e6-13af-4126-b83a-48521b6992fa?AWSAccessKeyId=AKIAJWLOWWHPBWQOPJZQ&Signature=DL7vhYgb5JrNDUWSR3UfCwBflFs%3D&Expires=1459959632"
       },
       "buildpack_provided_description":null,
       "checksum":null,
       "commit":"7240c75",
       "commit_description":"{\"app\":\"3.0.0-SNAPSHOT\",\"hash\":\"7240c75\",\"tag\":null}",
       "created_at":"2016-03-31T21:41:41Z",
       "id":"74f625e6-13af-4126-b83a-48521b6992fa",
       "process_types":{
         "web":"bin/root -Dhttp.port=${PORT} -Dlogger.file=${ENV_LOGGER} ${JAVA_OPTS}"
       },
       "size":191377290,
       "updated_at":"2016-03-31T21:41:41Z",
       "stack":{
         "id":"f9f9cbd7-2970-41ef-8db5-3df7123b041f",
         "name":"cedar-14"
       }
     }

This url is what you pass to the docker container as 

     -e SLUG="https://s3-external-1.amazonaws.com/herokuslugs/heroku.com/v1/74f625e6-13af-4126-b83a-48521b6992fa?AWSAccessKeyId=AKIAJWLOWWHPBWQOPJZQ&Signature=DL7vhYgb5JrNDUWSR3UfCwBflFs%3D&Expires=1459959632"   
     
Note: The quotes are important, don't leave them out     
     
      
