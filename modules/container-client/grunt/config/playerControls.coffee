_ = require 'lodash'
_.mixin(require('lodash-deep'))

js =
  ###
  All the core js files that are included in the player and may be
  concatted
  ###
  src: [
    'bower_components/angular-ui/build/angular-ui.min.js'
    'bower_components/angular-bootstrap/ui-bootstrap-tpls.js'
    'bower_components/bootstrap/js/dropdown.js'
    'bower_components/bootstrap/js/modal.js'
    'bower_components/bootstrap/js/tooltip.js'
    'bower_components/bootstrap/js/popover.js'
  ]
  dest: 'js/player-controls-prod.js'

  report: 'player-controls-js-report.json'


exports.config = (toTargetPath) ->

  uglify:
    playerControls:
      options:
        sourceMap:true
        sourceMapIncludeSource: true
        compress: false
        mangle: false
      files: [
        _.deepMapValues(_.cloneDeep(js), toTargetPath)
      ]

  compress:
    playerControls:
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
    playerControlsJs: _.deepMapValues(_.cloneDeep(js), toTargetPath)
