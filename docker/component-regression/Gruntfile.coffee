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

  getWebDriverOptions = ->
    basic =
      bail: grunt.option('bail')
      baseUrl: baseUrl
      configFile: './wdio.conf.js'
      defaultTimeout: getTimeout()
      desiredCapabilities: getDesiredCapabilities()
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
          {expand: true, cwd: '../../corespring-components/components', src: ['**/regression/**'], dest: 'components', filter: 'isFile'}
          {expand: true, cwd: '../../corespring-components/components', src: ['**/regression-data/**'], dest: 'components', filter: 'isFile'}
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

    replace:
      wdioconf:
        options:
          usePrefix: false
          patterns: [
            {
              match: 'GRUNT_BASE_URL_STRING',
              replacement: baseUrl
            },
            {
              match: 'GRUNT_CAPABILITIES_ARRAY_OF_OBJECT',
              replacement: [getDesiredCapabilities()]
            },
            {
              match: 'GRUNT_GREP',
              replacement: grunt.option('grep') || ''
            },
            {
              match: 'GRUNT_INVERT_GREP',
              replacement: grunt.option('invertGrep') || 'false'
            },
            {
              match: 'GRUNT_LOG_LEVEL_STRING',
              replacement: grunt.option('webDriverLogLevel') || 'silent'
            },
            {
              match: 'GRUNT_SAUCE_USER_STRING',
              replacement: if runOnSauceLabs then sauceUser else ''
            },
            {
              match: 'GRUNT_SAUCE_KEY_STRING',
              replacement: if runOnSauceLabs then sauceKey else ''
            },
            {
              match: 'GRUNT_SPECS_ARRAY_OF_STRING',
              replacement: ["components/#{ if (grunt.option('component')) then '**/' + grunt.option('component') + '/**' else '**' }/regression/*.js"]
            },
            {
              match: 'GRUNT_WAIT_FOR_TIMEOUT',
              replacement: getTimeout()
            }
          ]

        files: [
          {src: ['wdio.conf-template.js'], dest: 'wdio.conf.js'}
        ]
            

    webdriver:
      options: getWebDriverOptions()

      dev:
        tests: ["components/#{ if (grunt.option('component')) then '**/' + grunt.option('component') + '/**' else '**' }/regression/*.js"]

  grunt.initConfig(config)

  npmTasks = [
    'grunt-contrib-clean'
    'grunt-contrib-copy'
    'grunt-http-verify'
    'grunt-replace'
    'grunt-webdriver'
  ]

  grunt.loadNpmTasks(t) for t in npmTasks
  grunt.registerTask('regression', ['clean:regression', 'copy:dev', 'replace:wdioconf','http_verify:regressionRigWarmup', 'webdriver:dev'])
  grunt.registerTask('regression-from-docker', ['http_verify:regressionRigWarmup', 'webdriver:dev'])
