_ = require 'lodash'
_.mixin(require('lodash-deep'))

hasMinInPath = (p) -> p.indexOf('(.min)') != -1

mkUglify = (srcAndDest, compress, processFn) ->

  options:
    sourceMap:true
    sourceMapIncludeSource: true
    compress: compress
    mangle: false
  files: [
    _.deepMapValues(srcAndDest, processFn)
  ]

###
Builds a set of uglify options using an object in the following format:

src: [
  'blah/blah(.min).js',
  'blah/other.js'
]
dest: 'out.js'

It will split the src array into 2, one containing the minified files and one without.
The minified files will be concatted, the others will be minified and concatted
They'll all be joined at the end.
###
exports.buildUglifyOptions = (grunt, name, jsIn, processFn) ->

  splitPaths = _.groupBy jsIn.src, (p) -> if hasMinInPath(p) then 'min' else 'normal'
  #grunt.log.debug('split paths min: ', splitPaths.min)
  #grunt.log.debug('split paths normal: ', splitPaths.normal)

  cleanSplit = _.map(splitPaths.min, (p) -> p.replace("(.min)", ".min"))

  libs =
    src: cleanSplit
    dest: ".tmp/js/tmp.#{name}-libs-concatted.js"

  srcs =
    src: splitPaths.normal
    dest: ".tmp/js/tmp.#{name}-srcs-compressed-concatted.js"

  final =
    src: [libs.dest, srcs.dest]
    dest: jsIn.dest

  out = {}
  out["#{name}Libs"] = mkUglify(libs, false, processFn)
  out["#{name}Srcs"] = mkUglify(srcs, {}, processFn)
  out["#{name}Final"] = mkUglify(final, false, processFn)
  out
