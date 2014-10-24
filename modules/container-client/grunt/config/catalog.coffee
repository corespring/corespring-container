core = require './core'
player = require './player'
coreLibs = require './core-libs'
buildUglifyOptions = require('../lib/uglify-options-generator').buildUglifyOptions
_ = require 'lodash'
_.mixin(require('lodash-deep'))

catalogSrcs = [
    'bower_components/angular-route/angular-route(.min).js',
    'bower_components/angular-ui-router/release/angular-ui-router(.min).js' ,
    'bower_components/angular-bootstrap/ui-bootstrap-tpls(.min).js',
    'js/corespring/core-library.js',
    'js/corespring/server/init-core-library.js',
    'js/catalog/**/*.js',
    'js/render/services/**/*.js',
    'js/render/directives/**/*.js',
    'js/render/controllers/**/*.js',
    'js/common/services/message-bridge.js'
  ]

js =
  src: _.union(coreLibs.src, core.src, catalogSrcs)
  dest: 'js/catalog-prod.js'
  libs: [
    'bower_components/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML'
  ]
  report: 'catalog-js-report.json'

css = 
  src: ['css/catalog.css']
  dest: 'css/catalog.min.css'
  libs: [
    'bower_components/font-awesome/css/font-awesome.min.css',
    '//fonts.googleapis.com/css?family=Ubuntu:300,400,500,500italic,700'
  ]
  report: 'catalog-css-report.json'

exports.ngModules = _.union( player.ngModules, [
  'corespring-common.supporting-materials',
  'corespring-catalog.controllers',
  'ui.bootstrap',
  'ui.router'
])

exports.config = (grunt, toTargetPath) ->
  uglify: buildUglifyOptions(grunt, 'catalog', js, toTargetPath)
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
    catalogJs: _.extend(_.deepMapValues(_.cloneDeep(js), toTargetPath), { ngModules: @ngModules})
    catalogCss: _.deepMapValues(_.cloneDeep(css), toTargetPath)