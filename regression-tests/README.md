# Corespring Container Regression Testing

## Prerequisites
[Node and Npm](http://nodejs.org/)

## Installing
    npm install

## Running

### Run local webdriver against a local app

  *Note: make sure container is running and accessible under localhost:9000*  

    grunt regression

### Run SauceLabs webdriver against the heroku dev server
  *Make sure SAUCE_USERNAME and SAUCE_ACCESS_KEY are set in your env*  

    grunt regressionTestRunner:herokuDevt

### Run local webdriver against the heroku dev server
  *Make sure SAUCE_USERNAME and SAUCE_ACCESS_KEY are set in your env*  

    grunt regressionTestRunner:herokuDevt --local=true
