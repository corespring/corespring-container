_ = require('lodash')

###
Grunt task to output a json file of the resolved paths passed into it via 
src + dest
###
module.exports = (grunt) ->
  grunt.registerMultiTask 'pathReporter', 'Write out the paths to a json file', ->

    logFile = (f) ->
      grunt.log.debug('src', JSON.stringify(f.src))
      grunt.log.debug('dest', JSON.stringify(f.dest))

      grunt.log.debug('process', f.process)

      processFn = f.process || (p) -> p

      out = 
        src: _.map(f.src, processFn)
        dest: processFn(f.dest)

      path = f.report
      grunt.log.debug("report destination: #{path}")
      grunt.file.write(path, JSON.stringify(out, null, "  "))
      grunt.log.write("Created report here: #{f.report}")

    @files.forEach(logFile)

