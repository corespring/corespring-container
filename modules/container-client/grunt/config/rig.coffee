core = require './core'
coreLibs = require './core-libs'
buildUglifyOptions = require('../lib/uglify-options-generator').buildUglifyOptions
_ = require 'lodash'
_.mixin(require('lodash-deep'))

rigSrcs = [
    'bower_components/angular-ui/build/angular-ui(.min).js',
    'bower_components/angular-ui-ace/ui-ace(.min).js',
    'bower_components/ace-builds/src-min-noconflict/ace.js',
    'bower_components/ace-builds/src-min-noconflict/theme-twilight.js',
    'bower_components/ace-builds/src-min-noconflict/mode-xml.js',
    'bower_components/ace-builds/src-min-noconflict/worker-json.js',
    'bower_components/ace-builds/src-min-noconflict/mode-json.js',
    'js/render/services/**/*.js',
    'js/render/controllers/**/*.js',
    'js/render/directives/**/*.js',
    'js/rig/**/*.js',
  ]

js =
  src: _.union(coreLibs.src, core.src, rigSrcs)
  dest: 'js/rig-prod.js'
  libs: [
    'bower_components/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML'
  ]
  report: 'rig-js-report.json'

css = 
  src: ['css/rig.css']
  dest: 'css/rig.min.css'
  libs: [
    'bower_components/font-awesome/css/font-awesome.min.css',
    '//fonts.googleapis.com/css?family=Ubuntu:300,400,500,500italic,700'
  ]
  report: 'rig-css-report.json'

exports.ngModules = _.union(core.ngModules, [
    'corespring-rig.controllers',
    'corespring-rig.directives',
    'corespring-player.services',
    'corespring-player.directives',
    'ui.ace'
  ])
###
mkAppConfig = (name, grunt, js, css, ngModules, processFn) ->
  uglify: buildUglifyOptions(grunt, name, js, processFn)
  compress:
    player:
      options:
        mode: 'gzip'
      files: [
        {
          expand: true
          src: [processFn(js.dest)]
          ext: '.js.gz'
        }
      ]

  # write paths to a json file
  pathReporter:
    rigJs: _.extend(_.deepMapValues(_.cloneDeep(js), processFn), {ngModules: ngModules})
    rigCss: _.deepMapValues(_.cloneDeep(css), processFn) 
###
exports.config = (grunt, toTargetPath) ->
  uglify: buildUglifyOptions(grunt, 'rig', js, toTargetPath)
  compress:
    player:
      options:
        mode: 'gzip'
      files: [
        {
          expand: true
          src: [toTargetPath(js.dest)]
          ext: '.js.gz'
        }
      ]

  # write paths to a json file
  pathReporter:
    rigJs: _.extend(_.deepMapValues(_.cloneDeep(js), toTargetPath), {ngModules: @ngModules})
    rigCss: _.deepMapValues(_.cloneDeep(css), toTargetPath)