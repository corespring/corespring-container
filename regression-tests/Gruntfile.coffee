
module.exports = (grunt) ->

  config =
    regressionTestRunner:
      options:
        tests: ['tests/**/*.js']
        user: process.env.SAUCE_USERNAME
        key: process.env.SAUCE_ACCESS_KEY
      dev:
        baseUrl: "http://localhost:9000"
      herokuDevt:
        baseUrl: "http://corespring-container-devt.herokuapp.com"
        local: false
      herokuQa:
        baseUrl: "http://corespring-container-qa.herokuapp.com"
        local: false

  grunt.initConfig(config)
  grunt.loadNpmTasks('regression-test-runner')
  grunt.registerTask('regression', ['regressionTestRunner:dev'])
  grunt.registerTask('default', 'regression')
