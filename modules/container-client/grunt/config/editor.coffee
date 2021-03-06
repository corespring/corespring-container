core = require './core'
player = require './player'
coreLibs = require './core-libs'
_ = require 'lodash'

editorSrcs = [
  'bower_components/angular-bootstrap/ui-bootstrap-tpls(.min).js',
  'bower_components/angular-debounce/dist/angular-debounce(.min).js',
  'bower_components/angular-route/angular-route(.min).js',
  'bower_components/angular-ui-ace/ui-ace(.min).js',
  'bower_components/angular-ui-router/release/angular-ui-router(.min).js',
  'bower_components/angular-ui-select2/src/select2.js',
  'bower_components/angular-ui/build/angular-ui(.min).js',
  'bower_components/corespring-checkbox/src/directive.js',
  'bower_components/corespring-radio/src/directive.js',
  'bower_components/jquery.browser/dist/jquery.browser(.min).js',
  'bower_components/select2/select2(.min).js',
  'bower_components/undo.js/undo.js',
  'bower_components/wiggi-wiz/dist/wiggi-wiz.js',
  'bower_components/mathquill-build/build/mathquill.js'
  'bower_components/corespring-math-input/dist/corespring-math-input.js',
  'js/catalog/**/*.js',
  'js/common/**/*.js',
  'js/corespring/core-library.js',
  'js/corespring/server/init-core-library.js',
  'js/editing/**/*.js',
  'js/editor/**/*.js',
  'js/render/controllers/**/*.js'
  'js/render/directives/**/*.js',
  'js/render/services/**/*.js'
]

exports.js =
  src: _.union(coreLibs.js, core.src, editorSrcs)
  dest: 'js/editor-prod.js'
  libs: [
    'bower_components/ace-builds/src-min-noconflict/ace.js',
    'bower_components/ace-builds/src-min-noconflict/mode-json.js',
    'bower_components/ace-builds/src-min-noconflict/mode-xml.js',
    'bower_components/ace-builds/src-min-noconflict/theme-twilight.js',
    'bower_components/ace-builds/src-min-noconflict/worker-json.js',
    'bower_components/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML'
  ]
  report: 'editor-js-report.json'

exports.css =
  src: ['css/editor.css']
  dest: 'css/editor.min.css'
  libs: _.union(coreLibs.css, [
    'bower_components/select2/select2.css',
    'bower_components/components-font-awesome/css/font-awesome.min.css',
    '//fonts.googleapis.com/css?family=Ubuntu:300,400,500,500italic,700',
    'bower_components/corespring-math-input/dist/corespring-math-input.css',
    'bower_components/mathquill-build/build/mathquill.css'
  ])
  report: 'editor-css-report.json'

exports.ngModules = _.union(player.ngModules, [
  'corespring-editing.config',
  'corespring-common.supporting-materials',
  'corespring-editing.controllers',
  'corespring-editing.directives',
  'corespring-editing.services',
  'corespring-editing.wiggi-wiz-features.cs-image',
  'corespring-editing.wiggi-wiz-features.link',
  'corespring-editing.wiggi-wiz-features.mathjax',
  'corespring-editor.config',
  'corespring-editor.controllers',
  'corespring-editor.directives',
  'corespring-editor.profile.controllers',
  'corespring-editor.profile.directives',
  'corespring-editor.profile.services',
  'corespring-editor.services',
  'corespring.wiggi-wiz',
  'corespring.math-input',
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
