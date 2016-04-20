exports.config = {
  //sauce labs config
  user: "GRUNT_SAUCE_USER_STRING",
  key: "GRUNT_SAUCE_KEY_STRING",
  //
  // ==================
  // Specify Test Files
  // ==================
  // Define which test specs should run. The pattern is relative to the directory
  // from which `wdio` was called. Notice that, if you are calling `wdio` from an
  // NPM script (see https://docs.npmjs.com/cli/run-script) then the current working
  // directory is where your package.json resides, so `wdio` will be called from there.
  //
  specs: GRUNT_SPECS_ARRAY_OF_STRING,
  // Patterns to exclude.
  exclude: [
  // 'path/to/excluded/files'
],
  //
  // ============
  // Capabilities
  // ============
  // Define your capabilities here. WebdriverIO can run multiple capabilties at the same
  // time. Depending on the number of capabilities, WebdriverIO launches several test
  // sessions. Within your capabilities you can overwrite the spec and exclude option in
  // order to group specific specs to a specific capability.
  //
  // If you have trouble getting all important capabilities together, check out the
  // Sauce Labs platform configurator - a great tool to configure your capabilities:
  // https://docs.saucelabs.com/reference/platforms-configurator
  //
  capabilities: GRUNT_CAPABILITIES_ARRAY_OF_OBJECT,
  //
  // ===================
  // Test Configurations
  // ===================
  // Define all options that are relevant for the WebdriverIO instance here
  //
  // Level of logging verbosity: silent | verbose | command | data | result | error
  logLevel: "GRUNT_LOG_LEVEL_STRING",
  //
  // Enables colors for log output.
  coloredLogs: true,
  //
  // Saves a screenshot to a given path if a command fails.
  //screenshotPath: './errorShots/',
  //
  // Set a base URL in order to shorten url command calls. If your url parameter starts
  // with "/", the base url gets prepended.
  baseUrl: "GRUNT_BASE_URL_STRING",
  //
  // Default timeout for all waitForXXX commands.
  waitforTimeout: GRUNT_WAIT_FOR_TIMEOUT,
  //
  // Initialize the browser instance with a WebdriverIO plugin. The object should have the
  // plugin name as key and the desired plugin options as property. Make sure you have
  // the plugin installed before running any tests. The following plugins are currently
  // available:
  // WebdriverCSS: https://github.com/webdriverio/webdrivercss
  // WebdriverRTC: https://github.com/webdriverio/webdriverrtc
  // Browserevent: https://github.com/webdriverio/browserevent
  // plugins: {
  //     webdrivercss: {
  //         screenshotRoot: 'my-shots',
  //         failedComparisonsRoot: 'diffs',
  //         misMatchTolerance: 0.05,
  //         screenWidth: [320,480,640,1024]
  //     },
  //     webdriverrtc: {},
  //     browserevent: {}
  // },
  //
  // Framework you want to run your specs with.
  // The following are supported: mocha, jasmine and cucumber
  // see also: http://webdriver.io/guide/testrunner/frameworks.html
  //
  // Make sure you have the node package for the specific framework installed before running
  // any tests. If not please install the following package:
  // Mocha: `$ npm install mocha`
  // Jasmine: `$ npm install jasmine`
  // Cucumber: `$ npm install cucumber`
  framework: 'jasmine',
  //
  // Test reporter for stdout.
  // The following are supported: dot (default), spec and xunit
  // see also: http://webdriver.io/guide/testrunner/reporters.html
  reporter: 'spec',

  //
  // Options to be passed to Mocha.
  // See the full list at http://mochajs.org/
  mochaOpts: {
    ui: 'bdd'
  },
  // Options to be passed to Jasmine.
  jasmineNodeOpts: {
    //
    // Jasmine default timeout, this should be much bigger than any webdriver timeout
    // bc. otherwise jasmine will timeout before
    defaultTimeoutInterval: 1000 * 60 * 10,
    //
    // The Jasmine framework allows it to intercept each assertion in order to log the state of the application
    // or website depending on the result. For example it is pretty handy to take a screenshot everytime
    // an assertion fails.
    expectationResultHandler: function(passed, assertion) {
      // do something
    },
    //
    // Make use of jasmine specific grep functionality
    grep: "GRUNT_GREP",
    invertGrep: GRUNT_INVERT_GREP
  },
  //
  // =====
  // Hooks
  // =====
  // Run functions before or after the test. If one of them returns with a promise, WebdriverIO
  // will wait until that promise got resolved to continue.
  //
  // Gets executed before all workers get launched.
  onPrepare: function() {
    // do something
  },
  //
  // Gets executed before test execution begins. At this point you will have access to all global
  // variables like `browser`. It is the perfect place to define custom commands.
  before: function() {
    browser.getTestUrl = function(componentType, jsonFile){
      var url = "/client/rig/corespring-" + componentType + "/index.html?data=regression_" + jsonFile;
      return url;
    };
    browser.getItemJson = function(componentType, jsonFile) {
      var json = require("./components/corespring/" + componentType + "/regression-data/" + jsonFile);
      //console.log("getItemJson", json);
      return json;
    };
    browser.loadTest = function(componentType, jsonFile) {
      var url = this.getTestUrl(componentType, jsonFile);
      console.info("loadTest " + url);

      function getUserAgent() {
        return navigator.userAgent;
      }

      function logUserAgent(err, res) {
        console.log("UserAgent:", res ? res.value : 'undefined');
      }

      browser.url(url);
      browser.setViewportSize({width:1280, height: 1024});
      browser.waitForVisible('.player-rendered');
      browser.execute(getUserAgent, logUserAgent);
      return browser;
    };

    browser.waitAndClick = function(selector) {
      // console.log("click", selector)
      browser.pause(500);
      browser.waitForExist(selector);
      browser.click(selector);
      browser.pause(500);
      return browser;
    };

    browser.waitForRemoval = function(selector) {
      // console.log("waitForRemoval", selector)
      browser.waitForExist(selector, 2000, true);
      return browser;
    };

    browser.submitItem = function() {
      // console.log("submitItem")
      browser.execute('window.submit()');
      browser.pause(500);
      return browser;
    };

    browser.resetItem = function() {
      // console.log("resetItem")
      browser.execute('window.reset()');
      browser.pause(500);
      return browser;
    };

    browser.setInstructorMode = function() {
      // console.log("setInstructorMode");
      browser.execute('window.setMode("instructor")');
      browser.pause(500);
      return browser;
    };

    browser.dragAndDropWithOffset = function(fromSelector, toSelector) {
      browser.waitForExist(fromSelector);
      browser.waitForExist(toSelector);
      browser.moveToObject(fromSelector, 20, 4);
      browser.buttonDown(0);
      browser.pause(500);
      browser.moveToObject(toSelector, 20, 10);
      browser.pause(500);
      browser.buttonUp();
      browser.pause(1000);
      return browser;
    };

  },
  //
  // Gets executed after all tests are done. You still have access to all global variables from
  // the test.
  after: function(failures, pid) {
    // do something
  },
  //
  // Gets executed after all workers got shut down and the process is about to exit. It is not
  // possible to defer the end of the process using a promise.
  onComplete: function() {
    // do something
  }
};