_ = require "lodash"
componentDependencies = require "./grunt/lib/component-dependencies"
appConfigBuilder = require './grunt/lib/app-config-builder'


###
Configs...
###
player = require './grunt/config/player'
editor = require './grunt/config/editor'
catalog = require './grunt/config/catalog'
rig = require './grunt/config/rig'
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

  prepend = (pre, s) -> "#{pre}#{s}"

  comps = prepend.bind( null, '<%= common.dist %>/bower_components/')

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
      components:
        files: ['<%= common.components %>/**/*.less']
        tasks: ['runComponentLess']

    copy:
      less: copyConfig('less')
      jade: copyConfig('jade')

    pathReporter:
      options:
        process: tidyPaths

    jshint:
      options:
        jshintrc: '.jshintrc'
      main: ['<%= common.app %>/js/**/*.js', '!<%= common.app %>/**/*.min.js']

    prepPlayerLauncher:
      files: 
        src: [
          '<%= common.dist %>/bower_components/msgr.js/dist/msgr.js',
          "<%= common.app %>/**/player-launcher/*.js",
        ]
        dest: '<%= common.tmp %>/wrapped/player-launcher-wrapped.js'

    jasmine:
      unit:
        src: [
          '<%= common.app %>/js/corespring/**/*.js',
          '<%= common.app %>/js/catalog/**/*.js',
          '<%= common.app %>/js/common/**/*.js',
          '<%= common.app %>/js/editor/**/*.js',
          '<%= common.app %>/js/libs/*.js',
          '<%= common.app %>/js/render/**/*.js',
          '<%= common.app %>/js/rig/**/*.js',
          '<%= common.tmp %>/wrapped/player-launcher-wrapped.js',
          '!<%= common.app %>/js/**/player-launcher/*.js']
        options:
          keepRunner: true
          vendor: _.map(['angular/angular.js',
            'angular-mocks/angular-mocks.js',
            'wiggi-wiz/dist/wiggi-wiz.js',
            'jquery/dist/jquery.js',
            'lodash/dist/lodash.js'
            'saxjs/lib/sax.js',
            'bootstrap/dist/js/bootstrap.min.js',
            'angular-ui-bootstrap-bower/ui-bootstrap-tpls.js',
            'msgr.js/dist/msgr.js'], comps)
          specs: '<%= common.test %>/js/**/*-test.js'


    shell:
      mathjax_rm_pngs:
        command: 'rm -fr <%= common.dist %>/bower_components/mathjax/fonts/HTML-CSS/TeX/png'
        options :
          failOnError: true
      mathjax_rm_fonts:
        command: """
        rm -fr <%= common.dist %>/bower_components/mathjax/**/*.otf\n
        rm -fr <%= common.dist %>/bower_components/mathjax/**/*.eot\n
        """
        options :
          failOnError: true

  toTargetPath = (p) ->
    if(p.startsWith("//")) then p
    else
      "<%= common.dist %>/#{p.replace('(.min)', '')}"

  mkConfig = (name, config) ->
    appConfigBuilder.build(name, grunt, config.js, config.css, config.ngModules, toTargetPath)

  ###
  We merge in the app specific configs - run with --debug to see the final config.
  ###
  fullConfig = _.merge(config,
    mkConfig('catalog', catalog),
    mkConfig('editor', editor),
    mkConfig('rig', rig),
    mkConfig('player', player)
    mkConfig('playerControls', playerControls))

  grunt.log.debug(JSON.stringify(fullConfig, null, "  "))

  grunt.initConfig(fullConfig)

  npmTasks = [
    'grunt-shell',
    'grunt-contrib-copy',
    'grunt-contrib-uglify',
    'grunt-contrib-clean',
    'grunt-contrib-less',
    'grunt-contrib-watch',
    'grunt-contrib-jshint',
    'grunt-contrib-jasmine',
    'grunt-contrib-copy',
    'grunt-contrib-compress',
    'grunt-bower-clean'
  ]

  grunt.loadNpmTasks(t) for t in npmTasks
  grunt.loadTasks('./grunt/lib/tasks')
  grunt.registerTask('lcd', ['loadComponentDependencies'])
  grunt.registerTask('loadComponentDependencies', 'Load client side dependencies for the components', componentDependencies(grunt))
  grunt.registerTask('run', ['mk-css', 'pathReporter', 'runComponentLess', 'watch'])
  grunt.registerTask('mk-css', ['copy:less', 'less', 'runComponentLess'])
  grunt.registerTask('default', ['stage'])
  grunt.registerTask('test', ['lcd', 'prepPlayerLauncher', 'jasmine:unit'])

  grunt.registerTask('stage', 'Work with the play stage task',
    ['mk-css',
    'jshint',
    'uglify',
    'compress',
    'pathReporter'])

  grunt.registerTask('clean_bower',
    ['bower_clean',
    'shell:mathjax_rm_pngs',
    'shell:mathjax_rm_fonts'])

  grunt.registerTask('runComponentLess', ->

    cb = @async()

    spawnConfig =
      grunt: true
      args: [ 'less' ]
      opts:
        cwd: common.components

    spawnResultHandler = (err, result, code) ->
      console.log result.stdout
      cb()

    grunt.util.spawn( spawnConfig, spawnResultHandler )
  )
