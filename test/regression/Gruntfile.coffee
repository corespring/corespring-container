module.exports = (grunt) ->

  local = grunt.option('local') isnt false

  if grunt.option('target')
    baseUrl = "http://corespring-container-#{grunt.option('target')}.herokuapp.com"
    local = false
  else
    baseUrl = grunt.option('baseUrl') ? "http://localhost:9000"

  grunt.fail.fatal "saucelabs credentials missing" unless local || process.env.SAUCE_USERNAME? && process.env.SAUCE_ACCESS_KEY?

  GLOBAL.corespringRegressionTest =
    baseUrl: baseUrl
    local: local
    getUrl: (url) ->
      if url? && url.toString().toLowerCase().indexOf('http') == 0 then url else baseUrl + url

  commonConfig =
    app: "."

  # other options firefox,internet explorer
  # for internet explorer you have to install https://code.google.com/p/selenium/wiki/InternetExplorerDriver

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
    addDesiredCapability(options, "platform")
    options

  helpText = """
test locally:
  grunt regression
test remotely via saucelabs:
  grunt regression --target=qa
  grunt regression --target=devt
"""

  config =
    pkg: grunt.file.readJSON('package.json')
    common: commonConfig

    webdriver:
      regression:
        tests: ['src/**/*.js']
        options: getWebdriverOptions()

    http_verify:
      statusCode:
        url: baseUrl
        conditions: [
          {type: 'statusCode'}
        ]
        callback: (err) ->
          if err
            grunt.fail.fatal "Verifying #{baseUrl}: #{err}"

  grunt.initConfig(config)

  npmTasks = [
    'grunt-webdriver'
    'grunt-http-verify'
  ]

  grunt.loadNpmTasks(t) for t in npmTasks

  grunt.registerTask('logParams', 'internal task', ->
    grunt.log.writeln("local", local)
    grunt.log.writeln("baseUrl", baseUrl))

  grunt.registerTask('regression', helpText, ['logParams', 'http_verify:statusCode', 'webdriver:regression'])
  grunt.registerTask('default', 'regression')



