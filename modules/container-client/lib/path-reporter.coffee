_ = require('lodash')

###
Grunt task to output a json file of the resolved paths passed into it via 
src + dest
###
module.exports = (grunt) ->
  console.log('---------------------> ')
  grunt.registerMultiTask 'pathReporter', 'Write out the paths to a json file', ->

    grunt.log.debug( 'data', @data)
    grunt.log.debug( 'files', @files)

    logFile = (f) ->
      grunt.log.debug('src', JSON.stringify(f.src))
      grunt.log.debug('dest', JSON.stringify(f.dest))
      grunt.log.debug('report', JSON.stringify(f.report))

    @files.forEach(logFile)

