_ = require "lodash"


module.exports = (grunt) ->

  process = (cfg) ->
    (s) ->
      out = grunt.template.process(s, {data: cfg})
      out

  (files, cfg) ->
    processed = _.map(files, process(cfg))
    # note: add nonull so we don't worry about files that don't exist yet
    out = grunt.file.expand({ nonull: true }, processed)
    out