buildUglifyOptions = require('../lib/uglify-options-generator').buildUglifyOptions
_ = require 'lodash'
_.mixin(require('lodash-deep'))

buildCompress = (name, js, processFn) ->
  out =
    options:
      mode: 'gzip'
    expand: true
    src: processFn(js.dest)
    ext: '.js.gz'
  out

buildPathReporterJs = (name, js, processFn, ngModules, ngConfigModules) ->
  out = {}
  out["#{name}Js"] = _.extend(_.deepMapValues(_.cloneDeep(js), processFn), {ngModules: ngModules, ngConfigModules: ngConfigModules})

buildPathReporterCss = (name, css, processFn) ->
  out = {}
  out["#{name}Css"] = _.extend(_.deepMapValues(_.cloneDeep(css), processFn))


###
Builds a configuration object for the given js, css, ngmodules

outputs something like:

{
  uglify: {
    //uglify-config...
  },
  compress: {
    //compress-config ...
  },
  pathReporter: {
    //path-reporter config...
  }
}
###
exports.build = (name, grunt, js, css, ngModules, ngConfigModules, processFn) ->
  out =
    uglify: buildUglifyOptions(grunt, name, js, processFn)
    compress: {}
    pathReporter: {}

  out.compress["#{name}"] = buildCompress(name, js, processFn)
  out.pathReporter["#{name}Js"] = buildPathReporterJs('rig', js, processFn, ngModules, ngConfigModules)
  out.pathReporter["#{name}Css"] = buildPathReporterCss('rig', css, processFn) if css?

  grunt.log.debug(name + ' app config out: ', JSON.stringify(out, null, '  '))
  out
