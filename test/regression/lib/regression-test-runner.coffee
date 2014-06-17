
###
Run the regression tests
Depends on
  "grunt-http-verify": "~0.1.2",
  "grunt-webdriver": "~0.4.1",
  "http-verify": "~0.2.0",
###
module.exports = (grunt) ->

  help: """
run regression tests locally against http://localhost:9000:
  grunt regression
run regression test against arbitrary local url
  grunt regression --baseUrl=http://localhost:1234
run regression test on saucelabs against arbitrary external url
  grunt regression --baseUrl=http://www.example.com --local=false
to run tests on specific browser add
  --browserName=firefox|chrome|internet explorer|safari
to run tests on specific browser version add
  --version='10.2'
to run tests on specific platform add
  --platform=windows|osx
"""

  task: () ->

    local = grunt.option('local') isnt false
    baseUrl = grunt.option('baseUrl') ? "http://localhost:9000"

    sauceLabsWebdriverOptions =
      host: 'ondemand.saucelabs.com'
      port: 80
      user: process.env.SAUCE_USERNAME
      key: process.env.SAUCE_ACCESS_KEY
      desiredCapabilities:
        'tunnel-identifier': 'regression-tunnel'

    addDesiredCapability = (options, name) ->
      if(grunt.option(name))
        options.desiredCapabilites ?= {}
        options.desiredCapabilites[name] = grunt.option(name)
        grunt.log.writeln("desired capability ", name, grunt.option(name))
      options

    getWebdriverOptions = () ->
      options = if local then {} else sauceLabsWebdriverOptions
      addDesiredCapability(options, "browserName")
      addDesiredCapability(options, "version")
      addDesiredCapability(options, "platform")
      options

    GLOBAL.regressionTestRunnerGlobals =
      baseUrl: baseUrl
      local: local
      getUrl: (url) ->
        if url? && url.toString().toLowerCase().indexOf('http') == 0 then url else baseUrl + url

    grunt.fail.fatal "Missing saucelabs credentials" unless local || process.env.SAUCE_USERNAME? && process.env.SAUCE_ACCESS_KEY?

    tests = grunt.config('regressionTestRunner.tests')
    grunt.fail.fatal("Missing config for regressionTestrunner.tests") unless tests

    grunt.log.writeln("local:", local)
    grunt.log.writeln("baseUrl:", baseUrl)
    grunt.log.writeln("tests:", tests)

    grunt.config("webdriver.regression",
      tests: tests
      options: getWebdriverOptions()
    )

    grunt.config("http_verify.reachable",
      url: baseUrl
      conditions: []
      callback: (err) ->
        if err
          grunt.fail.fatal "Verifying #{baseUrl}: #{err}"
    )

    npmTasks = [
      'grunt-webdriver'
      'grunt-http-verify'
    ]

    grunt.loadNpmTasks(t) for t in npmTasks

    grunt.task.run(['http_verify:reachable', 'webdriver:regression'])


