componentDependencies = require "./lib/component-dependencies"
restoreResolutions = require "./lib/restore-resolutions"
prepPlayerLauncher = require "./lib/prep-player-launcher"
expander = require "./lib/expander"
_ = require "lodash"

playerConfig = require './grunt/config/player'


console.log('playerConfig.src')
console.log(playerConfig.src)

prependDist = (arr) ->
  _.map arr, (a) -> "<%= dist %>/#{a}"

module.exports = (grunt) ->

  config = 
    dist: 'target/scala-2.10/classes/container-client'
    uglify:
      player:
        options:
          sourceMap:true
          sourceMapIncludeSource: true
          compress: false 
          mangle: false 
        files: [
          {
            src: prependDist(playerConfig.src), 
            dest: "<%= dist %>/#{playerConfig.dest}"
          }
        ]

    compress: 
      player: 
        options: 
          mode: 'gzip'
        files: [
          { 
            expand: true 
            src: [ "<%= dist %>/#{playerConfig.dest}"]
            ext: '.js.gz'
          }
        ]


  npmTasks = [
    'grunt-shell',
    'grunt-contrib-jade',
    'grunt-contrib-copy',
    'grunt-contrib-uglify',
    'grunt-contrib-concat',
    'grunt-contrib-clean',
    'grunt-contrib-less',
    'grunt-contrib-watch',
    'grunt-contrib-jshint',
    'grunt-contrib-jasmine',
    'grunt-contrib-copy',
    'grunt-contrib-compress',
    'grunt-usemin',
    'grunt-ejs',
    'grunt-bower-clean'
  ]

  grunt.loadNpmTasks(t) for t in npmTasks

  grunt.registerTask('default', ['uglify', 'compress'])

  grunt.initConfig(config)

