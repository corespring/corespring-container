componentDependencies = require "./lib/component-dependencies"
restoreResolutions = require "./lib/restore-resolutions"
prepPlayerLauncher = require "./lib/prep-player-launcher"
expander = require "./lib/expander"
pathReporter = require './lib/path-reporter'
_ = require "lodash"

withDist = (d,s) -> "#{d}/#{s}"

playerConfig = require './grunt/config/player'

console.log(JSON.stringify(playerConfig))
playerResolved = 
  js:
    src: _.map(playerConfig.js.src, withDist.bind(null,'<%= common.dist %>')) , 
    dest: withDist("<%= common.dist %>", playerConfig.js.dest)



module.exports = (grunt) ->

  # Some common vars
  common = 
    app: 'src/main/resources/container-client'
    dist: 'target/scala-2.10/classes/container-client'
    test: 'src/test/resources/container-client'
    tmp: '.tmp'
    components: '../../corespring-components/components'
 
  config =
    pkg: grunt.file.readJSON('package.json')
    common: common

    less:
      player:
        expand: true
        cwd: '<%= common.dist %>/css'
        src: '*.less'
        dest: '<%= common.dist %>/css/'
        ext: '.css'
        flatten: false

    ## Uglify - js concatenation, minification
    uglify:
      player:
        options:
          sourceMap:true
          sourceMapIncludeSource: true
          compress: false 
          mangle: false 
        files: [
          playerResolved.js
        ]
    # Gzip compression
    compress: 
      player: 
        options: 
          mode: 'gzip'
        files: [
          { 
            expand: true 
            src: [playerResolved.js.dest]
            ext: '.js.gz'
          }
        ]
    # write paths to a json file
    pathReporter: 
      player:
        src: playerResolved.js.src
        dest: playerResolved.js.dest 
        report: '<%= common.dist %>/player-report.json'
        process: (p) ->
          p.replace(common.dist, '').replace('bower_components', 'components')


    watch:
      options:
        livereload: true
        debounceDelay: 5000
        files: ['<%= common.dist %>/**/*']
      jade:
        files: ['<%= common.app %>/**/*.jade']
        tasks: ['copy:jade']

    copy:
      less: 
        files: [
          {
            expand: true
            cwd: '<%= common.app %>',
            src: ['./**/*.less'],
            dest: '<%= common.dist %>'
          }
        ]
      jade:
        files: [
          {
            expand: true, 
            cwd: '<%= common.app %>', 
            src: ['./**/*.jade'], 
            dest: '<%= common.dist %>/'
          }
        ]
  grunt.initConfig(config)

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
  grunt.loadTasks('./lib')
  grunt.registerTask('run', ['watch'])
  grunt.registerTask('mk-css', ['copy:less', 'less'])
  grunt.registerTask('default', ['stage'])
  grunt.registerTask('stage', 'Work with the play stage task', 
    ['uglify', 'compress', 'pathReporter'])
