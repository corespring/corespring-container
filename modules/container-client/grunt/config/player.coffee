core = require './core'
coreLibs = require './core-libs'
_ = require 'lodash'

exports.dest = 'player-prod-new.js'
exports.src = _.union coreLibs.src, core.src, ['js/render/**/*.js']
