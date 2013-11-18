_ = require "lodash"


module.exports = (grunt) ->

  process = (cfg) ->
    (s) ->
      out = grunt.template.process(s, {data: cfg})
      out

  (files, cfg) ->
    processed = _.map(files, process(cfg))
    out = grunt.file.expand(processed)
    grunt.log.writeln(files)
    out