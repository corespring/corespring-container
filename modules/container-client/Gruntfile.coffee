componentDependencies = require "./lib/component-dependencies"
restoreResolutions = require "./lib/restore-resolutions"
prepPlayerLauncher = require "./lib/prep-player-launcher"
expander = require "./lib/expander"
pathReporter = require './lib/path-reporter'
_ = require "lodash"
player = require './grunt/config/player'
playerControls = require './grunt/config/playerControls'

String::startsWith ?= (s) -> @[...s.length] is s

copyConfig = (suffix) ->
  files: [
    {
      expand: true
      cwd: '<%= common.app %>',
      src: ['./**/*.' + suffix],
      dest: '<%= common.dist %>'
    }
  ]

lessConfig = (cleancss) ->

  suffix = if cleancss then ".min.css" else ".css"

  options:
    cleancss: cleancss
  expand: true
  cwd: '<%= common.dist %>/css'
  src: '*.less'
  dest: '<%= common.dist %>/css/'
  ext: suffix
  flatten: false

watchConfig = (suffix, tasks) ->
  files: ['<%= common.app %>/**/*.' + suffix]
  tasks: tasks

module.exports = (grunt) ->

  # Some common vars
  common =
    app: 'src/main/resources/container-client'
    dist: 'target/scala-2.10/classes/container-client'
    test: 'src/test/resources/container-client'
    tmp: '.tmp'
    components: '../../corespring-components/components'

  ###
  Remove the dist folder and prep the paths for use on the server.
  ###
  tidyPaths = (p) ->
    p
    .replace(common.dist, '')
    .replace('bower_components', 'components')
    .replace('///', '//')

  config =
    pkg: grunt.file.readJSON('package.json')
    common: common

    less:
      dev: lessConfig(false)
      production: lessConfig(true)

    watch:
      options:
        livereload: true
        debounceDelay: 5000
        files: ['<%= common.dist %>/**/*']
      jade: watchConfig('jade', ['copy:jade'])
      less: watchConfig('less', ['copy:less', 'less:dev'])

    copy:
      less: copyConfig('less')
      jade: copyConfig('jade')

    pathReporter:
      options:
        process: tidyPaths

  toTargetPath = (p) -> if(p.startsWith("//")) then p else "<%= common.dist %>/#{p}"

  fullConfig = _.merge(config, player.config(toTargetPath), playerControls.config(toTargetPath))
  grunt.log.debug(JSON.stringify(fullConfig, null, "  "))
  grunt.initConfig(fullConfig)

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
  grunt.registerTask('restoreResolutions', 'Add "resolutions" back to bower.json', restoreResolutions(grunt))
  grunt.registerTask('lcd', ['restoreResolutions', 'loadComponentDependencies'])
  grunt.registerTask('loadComponentDependencies', 'Load client side dependencies for the components', componentDependencies(grunt))
  grunt.registerTask('run', ['watch'])
  grunt.registerTask('mk-css', ['copy:less', 'less'])
  grunt.registerTask('default', ['stage'])
  grunt.registerTask('stage', 'Work with the play stage task',
    ['mk-css', 'uglify', 'compress', 'pathReporter'])
