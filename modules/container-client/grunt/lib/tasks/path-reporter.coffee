_ = require('lodash')

###
Grunt task to output a json file of the resolved paths passed into it via 
src + dest
###
module.exports = (grunt) ->
  grunt.registerMultiTask 'pathReporter', 'Write out the paths to a json file', ->

    opts = @options()
    
    logFile = (f) ->
      grunt.log.debug('src', JSON.stringify(f.src))
      grunt.log.debug('dest', JSON.stringify(f.dest))

      processFn = f.process || opts.process || (p) -> p

      grunt.log.debug('processFn', processFn)


      out = 
        src: _.map(f.src, processFn)
        dest: processFn(f.dest)
        libs: _.map(f.libs, processFn)

      for key, val of f
        grunt.log.debug('extra keys: ', key)
        if _.contains(['src', 'dest', 'libs','orig', 'report'], key)
          grunt.log.debug('skip: ', key)
        else
          grunt.log.debug('adding: ', key)
          grunt.log.debug('value: ', val)
          out[key] = val 
          grunt.log.debug('----->', out[key])

      path = f.report
      grunt.log.debug("report destination: #{path}")
      contents = JSON.stringify(out, null, "  ")
      grunt.log.debug("contents: #{contents}")
      grunt.file.write(path, contents)
      grunt.log.write("Created report here: #{f.report}")

    grunt.log.debug('options: ', @options())
    grunt.log.debug('data: ', @data)
    @files.forEach(logFile)

