componentDependencies = require "./lib/component-dependencies"
restoreResolutions = require "./lib/restore-resolutions"
prepPlayerLauncher = require "./lib/prep-player-launcher"
expander = require "./lib/expander"
pathReporter = require './lib/path-reporter'
_ = require "lodash"

withDist = (d,s) -> "#{d}/#{s}"

playerConfig = require './grunt/config/player'

playerResolved = 
  js:
    src: _.map(playerConfig.js.src, withDist.bind(null,'<%= common.dist %>')) , 
    dest: withDist("<%= common.dist %>", playerConfig.js.dest)
    libs: _.map(playerConfig.js.libs, withDist.bind(null,'<%= common.dist %>')) , 
  css: 
    src: _.map(playerConfig.css.src, withDist.bind(null,'<%= common.dist %>')) , 
    dest: withDist("<%= common.dist %>", playerConfig.css.dest)
    libs: _.map(playerConfig.css.libs, withDist.bind(null,'<%= common.dist %>')) , 


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
      options: 
        process: (p) ->
          p
            .replace(common.dist, '')
            .replace('bower_components', 'components')
            .replace('///', '//')
      playerJs:
        src: playerResolved.js.src
        dest: playerResolved.js.dest
        libs: playerResolved.js.libs 
        report: '<%= common.dist %>/player-js-report.json'
      playerCss:
        src: playerResolved.css.src
        dest: playerResolved.css.dest 
        libs: playerResolved.css.libs 
        report: '<%= common.dist %>/player-css-report.json'


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
    ['mk-css', 'uglify', 'compress', 'pathReporter'])
