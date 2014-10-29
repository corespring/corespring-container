_ = require 'lodash'
_.mixin(require('lodash-deep'))

exports.js =
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
