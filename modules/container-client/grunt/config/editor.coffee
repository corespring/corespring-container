core = require './core'
coreLibs = require './core-libs'
_ = require 'lodash'
_.mixin(require('lodash-deep'))
buildUglifyOptions = require('../lib/uglify-options-generator').buildUglifyOptions

editorSrcs = [
  'bower_components/angular-route/angular-route(.min).js',
  'bower_components/angular-ui-router/release/angular-ui-router(.min).js',
  'bower_components/wiggi-wiz/dist/wiggi-wiz.js',
  'bower_components/select2/select2(.min).js',
  'bower_components/angular-ui-select2/src/select2.js',
  'bower_components/angular-ui/build/angular-ui(.min).js',
  'bower_components/angular-bootstrap/ui-bootstrap-tpls(.min).js',
  #'bower_components/bootstrap/js/dropdown.js',
  #'bower_components/bootstrap/js/modal.js',
  #'bower_components/bootstrap/js/tooltip.js',
  #'bower_components/bootstrap/js/popover.js',
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
  'js/editor/**/*.js',
  'js/catalog/**/*.js',
  'js/render/services/**/*.js',
  'js/render/directives/**/*.js',
  'js/render/controllers/**/*.js'
]

js =
  src: _.union(coreLibs.src, core.src, editorSrcs)
  dest: 'js/editor-prod.js'
  libs: [
    'bower_components/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML'
  ]
  report: 'editor-js-report.json'

css =
  src: ['css/editor.css']
  dest: 'css/editor.min.css'
  libs: [
    'bower_components/font-awesome/css/font-awesome.min.css',
    '//fonts.googleapis.com/css?family=Ubuntu:300,400,500,500italic,700'
  ]
  report: 'editor-css-report.json'

  
exports.config = (grunt, toTargetPath) ->
  uglify: buildUglifyOptions(grunt, 'editor', js, toTargetPath)
  compress:
    editor:
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
    editorJs: _.deepMapValues(_.cloneDeep(js), toTargetPath)
    editorCss: _.deepMapValues(_.cloneDeep(css), toTargetPath)




