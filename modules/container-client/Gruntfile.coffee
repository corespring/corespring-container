_ = require "lodash"
componentDependencies = require "./grunt/lib/component-dependencies"
appConfigBuilder = require './grunt/lib/app-config-builder'

###
Configs...
###
player = require './grunt/config/player'
editor = require './grunt/config/editor'
singleComponentEditor = require './grunt/config/singleComponentEditor'
devEditor = require './grunt/config/devEditor'
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
  src: [
    '**/rig.less', 
    '**/player.less', 
    '**/editor.less', 
    '**/dev-editor.less',  
    '**/homepage.less', 
    '**/single-component-editor.less'
  ]
  dest: '<%= common.dist %>/css/'
  ext: suffix
  flatten: false

watchConfig = (suffix, tasks) ->
  files: ['<%= common.app %>/**/*.' + suffix]
  tasks: tasks

module.exports = (grunt) ->

  # Some common vars
  common =
    app: 'src'
    dist: 'target/scala-2.10/classes/container-client'
    test: 'test'
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

  ###
  Clean up the summary output of jasmine
  by removing grunt-contrib-jasmine paths from stacktrace output
  This is a hack of course, but helpful.
  Unfortunately grunt-contrib-jasmine doesn't allow us to replace
  the reporter
  ###
  gruntLogWriteln = grunt.log.writeln
  grunt.log.writeln = (s) ->
    if(!(s && s.indexOf('  at ') >= 0 && s.indexOf('grunt-contrib-jasmine') >= 0))
      gruntLogWriteln(s || '')

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
      js:
        files: ['<%= common.app %>/**/*.js']
        tasks: ['copy:js']

      jade: watchConfig('jade', ['copy:jade'])
      less: watchConfig('less', ['copy:less', 'less:dev'])
      directives:
        files: ['<%= common.app %>/**/*.jade']
        tasks: ['directive-templates']
      components:
        files: ['<%= common.components %>/**/*.less']
        tasks: ['component-less']

    copy:
      less: copyConfig('less')
      jade: copyConfig('jade')
      js: copyConfig('js')

    pathReporter:
      options:
        process: tidyPaths

    jshint:
      main: ['<%= common.app %>/js/**/*.js', '!<%= common.app %>/**/*.min.js']
      test: ['<%= common.test %>/js/**/*.js']

    prepPlayerLauncher:
      files:
        src: [
          '<%= common.dist %>/bower_components/msgr.js/dist/msgr.js',
          '<%= common.app %>/**/player-launcher/*.js'
        ]
        dest: '<%= common.tmp %>/wrapped/player-launcher-wrapped.js'

    jasmine:
      unit:
        src: [
          '<%= common.app %>/js/corespring/**/*.js',
          '<%= common.app %>/js/**/*.js',
          '<%= common.dist %>/js/**/*.tpl.js',
          '!<%= common.app %>/js/player-launcher/**/*.js',
          '!<%= common.app %>/js/old-*/**/*.js',
          '<%= common.tmp %>/wrapped/player-launcher-wrapped.js',
          '<%= common.test %>/js/**/*-mocks.js',
          ]
        options:
          summary: true
          keepRunner: true
          vendor: _.map([
            'jquery/dist/jquery.js',
            'angular/angular.js',
            'angular-mocks/angular-mocks.js',
            'jquery-mockjax/jquery.mockjax.js',
            'wiggi-wiz/dist/wiggi-wiz.js',
            'lodash/dist/lodash.js'
            'saxjs/lib/sax.js',
            'bootstrap/dist/js/bootstrap.min.js',
            'angular-ui-bootstrap-bower/ui-bootstrap-tpls.js',
            'msgr.js/dist/msgr.js'], comps)
          specs: [
            '<%= common.test %>/js/**/*-test.js',
            '!<%= common.test %>/js/old-*/**/*-test.js'
            ]

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

    jade:
      directives:
        cwd: '<%= common.app %>'
        src:  ['**/directives/**.jade', '**/wiggi-wiz-features/**/*.jade']
        dest: '<%= common.dist %>'
        ext: '.html'
        expand: true

    ngtemplates:
      all:
        cwd: '<%= common.dist %>'
        dest: '<%= common.dist %>'
        src:  ['js/**/directives/**.html', 'js/**/wiggi-wiz-features/**/*.html']
        options:
          module: 'corespring-templates'
          url: (u) -> u.replace( common.dist + '/js', '')
        expand: true
        ext: '.tpl.js'

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
    mkConfig('singleComponentEditor', singleComponentEditor),
    mkConfig('devEditor', devEditor),
    mkConfig('rig', rig),
    mkConfig('player', player)
    mkConfig('playerControls', playerControls)
  )

  #grunt.log.debug(JSON.stringify(fullConfig, null, "  "))

  grunt.initConfig(fullConfig)

  npmTasks = [
    'grunt-shell',
    'grunt-contrib-copy',
    'grunt-contrib-jade',
    'grunt-contrib-uglify',
    'grunt-contrib-clean',
    'grunt-contrib-less',
    'grunt-contrib-watch',
    'grunt-contrib-jshint',
    'grunt-contrib-jasmine',
    'grunt-contrib-copy',
    'grunt-contrib-compress',
    'grunt-bower-clean',
    'grunt-angular-templates'
  ]

  writeConfig = () ->
    grunt.file.write( 'grunt-debug-config.json', JSON.stringify(fullConfig, null, "  "))

  grunt.loadNpmTasks(t) for t in npmTasks
  grunt.loadTasks('./grunt/lib/tasks')
  grunt.registerTask('none', [])
  grunt.registerTask('write-config', '',writeConfig)
  grunt.registerTask('lcd', ['loadComponentDependencies'])
  grunt.registerTask('loadComponentDependencies', 'Load client side dependencies for the components', componentDependencies(grunt))
  grunt.registerTask('run', ['mk-css', 'directive-templates','pathReporter', 'component-less', 'watch'])
  grunt.registerTask('mk-css', ['copy:less', 'less', 'component-less'])
  grunt.registerTask('default', ['stage'])
  grunt.registerTask('directive-templates', ['jade:directives', 'ngtemplates'])
  grunt.registerTask('test', ['lcd', 'prepPlayerLauncher', 'directive-templates', 'jshint', 'jasmine:unit'])
  grunt.registerTask('stage', 'Work with the play stage task',
    ['mk-css',
    'component-version-info'
    'directive-templates',
    'jshint',
    'uglify',
    'compress',
    'pathReporter',
    'cleanAssets'])

  grunt.registerTask('cleanAssets',
    ['bower_clean',
    'shell:mathjax_rm_pngs',
    'shell:mathjax_rm_fonts'])

  ###
  Result handler for spawned grunt tasks
  ###
  spawnResultHandler = (done) ->
    (err, result, code) ->
      console.log result.stdout
      if err?
        console.log(result.stderr)
        grunt.fail.fatal(err)
      done()

  ###
  Run a grunt task in the components folder
  ###
  runComponentGrunt = (cmd, done) ->
    grunt.log.writeln('running `grunt ' + cmd + '` in this directory:', common.components)
    config =
      grunt: true
      args: [cmd]
      opts:
        cwd: common.components

    grunt.util.spawn( config, spawnResultHandler(done) )

  grunt.registerTask 'component-version-info', ->
    done = @async()
    runComponentGrunt('version-info', done)

  grunt.registerTask 'component-less', ->
    done = @async()
    runComponentGrunt('less', done)
