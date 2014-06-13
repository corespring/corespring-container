module.exports = (grunt) ->

  local = grunt.option('local') isnt false

  if grunt.option('target')
    baseUrl = "http://corespring-container-#{grunt.option('target')}.herokuapp.com"
    local = false
  else
    baseUrl = grunt.option('baseUrl') ? "http://localhost:9000"

  commonConfig =
    app: "."

  localWebdriverOptions =
    testParams:
      baseUrl: baseUrl
    desiredCapabilities:
      browserName: 'chrome'
  # other options firefox,internet explorer
  # for internet explorer you have to install https://code.google.com/p/selenium/wiki/InternetExplorerDriver

  sauceLabsWebdriverOptions =
    host: 'ondemand.saucelabs.com'
    port: 80
    user: process.env.SAUCE_USERNAME
    key: process.env.SAUCE_ACCESS_KEY
    testParams:
      baseUrl: baseUrl
    desiredCapabilities:
      platform: 'WINDOWS'
      browserName: 'chrome'
      'tunnel-identifier': 'regression-tunnel'

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
      options: if local then localWebdriverOptions else sauceLabsWebdriverOptions
      regression:
        tests: ['src/**/*.js']

    http_verify:
      statusCode:
        url: baseUrl
        conditions: [
          {type: 'statusCode', operator: 'equals', value: '200'}
          {type: 'statusCode', operator: 'equals', value: '302'}
        ]
        callback: (err) ->
          grunt.fail.fatal "#{baseUrl} not reachable, #{err}"

  grunt.initConfig(config)

  npmTasks = [
    'grunt-webdriver',
    'grunt-http-verify'
  ]

  grunt.loadNpmTasks(t) for t in npmTasks

  grunt.registerTask('logParams', 'internal task', ->
    grunt.log.writeln("local", local)
    grunt.log.writeln("baseUrl", baseUrl))

  grunt.registerTask('regression', helpText, ['logParams', 'http_verify:statusCode', 'webdriver:regression'])
  grunt.registerTask('default', 'help', ->
    grunt.log.writeln(helpText)
  )



