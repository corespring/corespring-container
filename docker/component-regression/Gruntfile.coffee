_ = require 'lodash'
expect = require('expect');

module.exports = (grunt) ->
  runOnSauceLabs = grunt.option('sauceLabs') or false
  sauceUser = grunt.option('sauceUser') or process.env.SAUCE_USERNAME
  sauceKey = grunt.option('sauceKey') or process.env.SAUCE_ACCESS_KEY
  baseUrl = grunt.option('baseUrl') or 'http://localhost:9000'

  if(runOnSauceLabs)
    grunt.log.debug("sauce user: #{sauceUser}")
    grunt.log.debug("sauce key: #{sauceKey}")
    grunt.log.debug("baseUrl: #{baseUrl}")
    grunt.fail.fatal('saucelabs error - you must define both user and key') if( (sauceUser and !sauceKey) or (!sauceUser and sauceKey))
    grunt.fail.fatal('saucelabs error - you must use a remote url as the base url') if(sauceUser and baseUrl == 'http://localhost:9000')

  getTimeout = ->
    grunt.option('timeout') or 10000

  getDesiredCapabilities = ->
    browserVersion = grunt.option('browserVersion') || ''
    platform = grunt.option('platform') || ''

    capabilities =
      browserName: grunt.option('browserName') || 'firefox'
      timeoutInSeconds: getTimeout() / 1000
      defaultTimeout: getTimeout()
      waitforTimeout: getTimeout()
      name: grunt.option('sauceJob') || 'components-regression-test'
      recordVideo: grunt.option('sauceRecordVideo') || false
      recordScreenshots: grunt.option('sauceRecordScreenshots') || false

    capabilities.version = browserVersion if browserVersion
    capabilities.platform = platform if platform
    capabilities

  extendBrowser = (browser) ->
    browser.loadTest = (componentType, jsonFile) ->
      url = "#{baseUrl}/client/rig/corespring-#{componentType}/index.html?data=regression_#{jsonFile}"
      # console.log("Load Test:", url)

      getUserAgent = ->
        navigator.userAgent

      logUserAgent = (err,res) ->
        console.log("UserAgent:", if res then res.value else 'undefined')

      browser
        .url(url)
        .waitFor('.player-rendered')
        #.execute(getUserAgent, logUserAgent)

      browser

    browser.waitAndClick = (selector) ->
        # console.log("click", selector)
        browser.pause(500)
        browser.waitFor(selector)
        browser.click(selector)
        browser.pause(500)
        browser

    browser.waitForRemoval = (selector) ->
        # console.log("waitForRemoval", selector)
        browser.waitForExist(selector, 2000, true, (err,res) ->
          expect(res).toBe(true);
        )
        browser

    browser.submitItem = () ->
        # console.log("submitItem")
        browser.execute('window.submit()')
        browser.pause(500)
        browser

    browser.resetItem = () ->
        # console.log("resetItem")
        browser.execute('window.reset()')
        browser.pause(500)
        browser

    browser.setInstructorMode = () ->
        # console.log("setInstructorMode")
        browser.execute('window.setMode("instructor")')
        browser.pause(500)
        browser

    browser.dragAndDropWithOffset = (fromSelector, toSelector) ->
        browser
          .waitFor(fromSelector)
          .waitFor(toSelector)
          .moveToObject(fromSelector, 20, 4)
          .buttonDown(0)
          .pause(500)
          .moveToObject(toSelector, 20, 10)
          .pause(500)
          .buttonUp()
          .pause(500);
        browser

    browser

  getWebDriverOptions = ->
    basic =
      getItemJson: (componentType, jsonFile) ->
        require "./components/corespring/#{componentType}/regression-data/#{jsonFile}"

      bail: grunt.option('bail')
      baseUrl: baseUrl
      defaultTimeout: getTimeout()
      desiredCapabilities: getDesiredCapabilities()
      extendBrowser: extendBrowser
      grep: grunt.option('grep')
      invertGrep: grunt.option('invertGrep')
      # see: http://webdriver.io/guide/getstarted/configuration.html silent|verbose|command|data|result
      logLevel: grunt.option('webDriverLogLevel') || 'silent'
      timeoutInSeconds: getTimeout() / 1000
      waitforTimeout: getTimeout()

    sauce =
      host: 'ondemand.saucelabs.com'
      port: 80
      user: sauceUser
      key: sauceKey

    if(runOnSauceLabs)
      _.merge(basic, sauce)
    else
      basic

  commonConfig =
    componentPath: grunt.config('componentPath') ? 'components'

  config =
    pkg: grunt.file.readJSON('package.json')
    common: commonConfig

    clean:
      regression: ['components/*']

    copy:
      dev:
        files: [
          {expand: true, src: ['../../components/**/regression/**'], dest: 'regression/components/', filter: 'isFile'}
          {expand: true, src: ['../../components/**/regression-data/**'], dest: 'regression/components/', filter: 'isFile'}
        ]

    http_verify:
      regressionRigWarmup:
        url: baseUrl + "/client/rig/corespring-inline-choice/index.html?data=regression_one.json",
        conditions: [
          {
            type: 'statusCode'
          }
        ],
        callback: (err) ->
          if(err)
            throw grunt.util.error('Error checking: ' + baseUrl + ' : ' + err)
          else
            grunt.log.ok('Success checking: ' + baseUrl)

    webdriver:
      options: getWebDriverOptions()

      dev:
        tests: ["components/#{ if (grunt.option('component')) then '**/' + grunt.option('component') + '/**' else '**' }/regression/*.js"]

  grunt.initConfig(config)

  npmTasks = [
    'grunt-contrib-clean'
    'grunt-contrib-copy'
    'grunt-http-verify'
    'grunt-webdriver'
  ]

  grunt.loadNpmTasks(t) for t in npmTasks
  grunt.registerTask('regression', ['copy:dev', 'http_verify:regressionRigWarmup', 'webdriver:dev', 'clean:regression'])
  grunt.registerTask('regression-from-docker', ['http_verify:regressionRigWarmup', 'webdriver:dev'])
