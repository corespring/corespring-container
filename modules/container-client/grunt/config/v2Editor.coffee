core = require './core'
player = require './player'
coreLibs = require './core-libs'
_ = require 'lodash'

editorSrcs = [
  'bower_components/angular-animate/angular-animate(.min).js',
  'bower_components/angular-route/angular-route(.min).js',
  'bower_components/angular-ui-router/release/angular-ui-router(.min).js',
  'bower_components/wiggi-wiz/dist/wiggi-wiz.js',
  'bower_components/select2/select2(.min).js',
  'bower_components/angular-ui-select2/src/select2.js',
  'bower_components/angular-ui/build/angular-ui(.min).js',
  'bower_components/angular-bootstrap/ui-bootstrap-tpls(.min).js',
  'bower_components/angular-ui-ace/ui-ace(.min).js',
  'bower_components/ace-builds/src-min-noconflict/ace.js',
  'bower_components/ace-builds/src-min-noconflict/theme-twilight.js',
  'bower_components/ace-builds/src-min-noconflict/mode-xml.js',
  'bower_components/ace-builds/src-min-noconflict/worker-json.js',
  'bower_components/ace-builds/src-min-noconflict/mode-json.js',
  'bower_components/jquery.browser/dist/jquery.browser(.min).js',
  'bower_components/undo.js/undo.js',
  'js/corespring/core-library.js',
  'js/corespring/server/init-core-library.js',
  'js/v2-editor/**/*.js',
  'js/v2-catalog/**/*.js',
  'js/render/services/**/*.js',
  'js/render/directives/**/*.js',
  'js/render/controllers/**/*.js'
]

exports.js =
  src: _.union(coreLibs.js, core.src, editorSrcs)
  dest: 'js/v2-editor-prod.js'
  libs: [
    'bower_components/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML'
  ]
  report: 'v2-editor-js-report.json'

exports.css =
  src: ['css/v2-editor.css']
  dest: 'css/v2-editor.min.css'
  libs: _.union(coreLibs.css, [
    'bower_components/select2/select2.css',
    'bower_components/font-awesome/css/font-awesome.min.css',
    '//fonts.googleapis.com/css?family=Ubuntu:300,400,500,500italic,700'
  ])
  report: 'v2-editor-css-report.json'

exports.ngModules = _.union(player.ngModules, [
  'ngAnimate',
  'corespring-common.supporting-materials',
  'corespring-editor.services',
  'corespring-editor.controllers',
  'corespring-editor.directives',
  'ui.sortable',
  'ui.bootstrap',
  'ui.ace',
  'ui.router',
  'cs.directives',
  'ngRoute',
  'ui.select2',
  'corespring.wiggi-wiz' ])
