core = require './core'
coreLibs = require './core-libs'
_ = require 'lodash'


module.exports =
  js:
    ###
    All the core js files that are included in the player and may be 
    concatted
    ###
    src: _.union(coreLibs.src, core.src, ['js/render/**/*.js'])
    ###
    The output for the concatted js
    ### 
    dest: 'js/player-prod-new.js'
    ###
    Any other js file that should be added to the player, but not concatted
    ###
    libs: [
      'bower_components/mathjax/MathJax.js?config=TeX-AMS-MML_HTMLorMML'
    ]
      
  css:
    src: ['css/player.css']
    dest: 'css/player.min.css'
    libs: [
      'bower_components/font-awesome/css/font-awesome.min.css',
      '//fonts.googleapis.com/css?family=Ubuntu:300,400,500,500italic,700'
    ]