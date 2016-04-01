core = require './core'
player = require './player'
coreLibs = require './core-libs'
_ = require 'lodash'

baseName = "singleComponentEditor"

editorSrcs = [
  'bower_components/angular-bootstrap/ui-bootstrap-tpls(.min).js',
  'bower_components/angular-debounce/dist/angular-debounce(.min).js',
  'bower_components/angular-ui-ace/ui-ace(.min).js',
  'bower_components/angular-ui-select2/src/select2.js',
  'bower_components/angular-ui/build/angular-ui(.min).js',
  'bower_components/jquery-lockfixed/jquery.lockfixed(.min).js',
  'bower_components/corespring-checkbox/src/directive.js',
  'bower_components/corespring-radio/src/directive.js',
  'bower_components/jquery.browser/dist/jquery.browser(.min).js',
  'bower_components/select2/select2(.min).js',
  'bower_components/undo.js/undo.js',
  'bower_components/wiggi-wiz/dist/wiggi-wiz.js',
  'js/common/**/*.js',
  'js/component-editor/**/*.js',
  'js/corespring/core-library.js',
  'js/corespring/server/init-core-library.js',
  'js/editing/**/*.js',
  'js/render/controllers/**/*.js',
  'js/render/directives/**/*.js',
  'js/render/services/**/*.js'
]

exports.js =
  src: _.union(coreLibs.js, core.src, editorSrcs)
  dest: 'js/single-component-editor-prod.js'
  libs: [
    'bower_components/ace-builds/src-min-noconflict/ace.js',
    'bower_components/ace-builds/src-min-noconflict/mode-json.js',
    'bower_components/ace-builds/src-min-noconflict/mode-xml.js',
    'bower_components/ace-builds/src-min-noconflict/theme-twilight.js',
    'bower_components/ace-builds/src-min-noconflict/worker-json.js',
    'bower_components/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML'
  ]
  report: "#{baseName}-js-report.json"

exports.css =
  src: ['css/single-component-editor.css']
  dest: 'css/single-component-editor.min.css'
  libs: _.union(coreLibs.css, [
    'bower_components/select2/select2.css',
    'bower_components/components-font-awesome/css/font-awesome.min.css'
  ])
  report: "#{baseName}-css-report.json"

exports.ngModules = _.union(player.ngModules, [
  'corespring-editing.config',
  'corespring-editing.controllers',
  'corespring-editing.directives',
  'corespring-editing.services',
  'corespring-editing.wiggi-wiz-features',
  'corespring-editing.wiggi-wiz-features.cs-image',
  'corespring-editing.wiggi-wiz-features.link',
  'corespring-editing.wiggi-wiz-features.mathjax',
  'corespring-singleComponentEditor.controllers',
  'corespring-singleComponentEditor.directives'
  'corespring-singleComponentEditor.services',
  'corespring.wiggi-wiz',
  'ui.ace',
  'ui.bootstrap.tabs',
  'wiggi-wiz.features.core'
])
