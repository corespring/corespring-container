core = require './core'
player = require './player'
coreLibs = require './core-libs'
_ = require 'lodash'

editorSrcs = [
  'bower_components/angular-animate/angular-animate(.min).js',
  'bower_components/wiggi-wiz/dist/wiggi-wiz.js',
  'bower_components/select2/select2(.min).js',
  'bower_components/angular-ui-select2/src/select2.js',
  'bower_components/angular-ui/build/angular-ui(.min).js',
  'bower_components/angular-ui-ace/ui-ace(.min).js',
  'bower_components/angular-bootstrap/ui-bootstrap-tpls(.min).js',
  'bower_components/angular-debounce/dist/angular-debounce(.min).js',
  'bower_components/jquery.browser/dist/jquery.browser(.min).js',
  'bower_components/corespring-checkbox/src/directive.js',
  'bower_components/corespring-radio/src/directive.js',
  'js/corespring/core-library.js',
  'js/corespring/server/init-core-library.js',
  'js/common/**/*.js',
  'js/editor/**/*.js',
  'js/render/services/**/*.js',
  'js/render/directives/**/*.js',
  'js/render/controllers/**/*.js'
]

exports.js =
  src: _.union(coreLibs.js, core.src, editorSrcs)
  dest: 'js/single-component-editor-prod.js'
  libs: [
    'bower_components/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML'
  ]
  report: 'single-component-editor-js-report.json'

exports.css =
  src: ['css/single-component-editor.css']
  dest: 'css/editor.min.css'
  libs: _.union(coreLibs.css, [
    'bower_components/select2/select2.css',
    'bower_components/components-font-awesome/css/font-awesome.min.css'
  ])
  report: 'single-component-editor-css-report.json'

exports.ngModules = _.union(player.ngModules, [
  'corespring.wiggi-wiz',
  'cs.directives',
  'ngAnimate',
  'ngRoute',
  'rt.debounce',
  'ui.ace',
  'ui.bootstrap',
  'ui.router',
  'ui.select2',
  'ui.sortable'
])
