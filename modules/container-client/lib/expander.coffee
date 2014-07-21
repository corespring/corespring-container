_ = require "lodash"


module.exports = (grunt) ->

  process = (cfg) ->


    grunt.log.debug( "> " + cfg)
    (s) ->
      out = grunt.template.process(s, {data: cfg})
      out

  (files, cfg) ->

    throw "No cfg" if !cfg?
    throw "No files" if !files?

    grunt.log.debug( "expander > config: #{JSON.stringify(cfg)}")
    grunt.log.debug( "expander > files: #{files} -- array? #{_.isArray(files)}"  )

    processed = _.map(files, process(cfg))
    # note: add nonull so we don't worry about files that don't exist yet
    out = grunt.file.expand({ nonull: true }, processed)
    out