module.exports = (grunt) ->

  local = grunt.option('local') isnt false
  GLOBAL.baseUrl = grunt.option('baseUrl') ? "http://localhost:9000"

  commonConfig =
    app: "."

  localWebdriverOptions =
    desiredCapabilities:
      browserName: 'chrome'
  # other options firefox,internet explorer
  # for internet explorer you have to install https://code.google.com/p/selenium/wiki/InternetExplorerDriver

  sauceLabsWebdriverOptions =
    host: 'ondemand.saucelabs.com',
    port: 80,
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
    desiredCapabilities:
      platform: 'WINDOWS',
      browserName: 'chrome',
      'tunnel-identifier': 'regression-tunnel'

  config =
    pkg: grunt.file.readJSON('package.json')
    common: commonConfig

    webdriver:
      options: if local then localWebdriverOptions else sauceLabsWebdriverOptions
      regression:
        tests: ['src/**/*.js']

  grunt.initConfig(config)

  npmTasks = [
    'grunt-webdriver'
  ]

  grunt.loadNpmTasks(t) for t in npmTasks

  grunt.registerTask('default', ['webdriver:regression'])


