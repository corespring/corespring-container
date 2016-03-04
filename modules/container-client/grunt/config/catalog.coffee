core = require './core'
player = require './player'
coreLibs = require './core-libs'
_ = require 'lodash'

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

exports.js =
  src: _.union(coreLibs.js, core.src, catalogSrcs)
  dest: 'js/catalog-prod.js'
  libs: [
    'bower_components/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML'
  ]
  report: 'catalog-js-report.json'

exports.css =
  src: ['css/player.css','css/editor.css']
  dest: 'css/editor.min.css'
  libs: _.union(coreLibs.css, [
    'bower_components/select2/select2.css',
    'bower_components/components-font-awesome/css/font-awesome.min.css',
    '//fonts.googleapis.com/css?family=Ubuntu:300,400,500,500italic,700'
  ])
  report: 'catalog-css-report.json'

exports.ngModules = _.union( player.ngModules, [
  'corespring-common.supporting-materials',
  'corespring-catalog.controllers',
  'ui.bootstrap',
  'ui.router'
])

exports.ngConfigModules = _.union( player.ngConfigModules, [

])

