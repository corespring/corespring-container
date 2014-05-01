componentDependencies = require "./lib/component-dependencies"
restoreResolutions = require "./lib/restore-resolutions"
prepPlayerLauncher = require "./lib/prep-player-launcher"
expander = require "./lib/expander"
_ = require "lodash"

module.exports = (grunt) ->

  devMode = grunt.option("devMode") != false 

  common = 
    app: 'src/main/resources/container-client'
    dist: 'target/scala-2.10/classes/container-client'
    test: 'src/test/resources/container-client'
    tmp: '.tmp'
    components: '../../corespring-components/components'
    player: 
      src:  [
        '<%= common.dist %>/js/render/**/*.js' ]
      concatDest: '.tmp/concat/js/player.js'
      dest: '<%= common.dist %>/js/prod-player.js'

    coreLibs: 
      src: [
        '<%= common.dist %>/bower_components/es5-shim/es5-shim.min.js',
        '<%= common.dist %>/bower_components/console-polyfill/index.js',
        '<%= common.dist %>/bower_components/jquery/dist/jquery.min.js',
        '<%= common.dist %>/bower_components/jquery-ui/ui/jquery-ui.js',
        '<%= common.dist %>/bower_components/angular/angular.min.js',
        '<%= common.dist %>/bower_components/lodash/dist/lodash.min.js',
        '<%= common.dist %>/bower_components/angular-ui-sortable/src/sortable.js',
        '<%= common.dist %>/bower_components/corespring-ng-components/build/corespring-ng-components.js',
      ]
      concatDest: '<%= common.dist %>/js/core-libs.js'

    core: 
      dest: '<%= common.dist %>/js/prod-core.js'
      concatDest: '.tmp/concat/js/core.js'
      src: [
        '<%= common.dist %>/js/common/**/*.js', 
        '<%= common.dist %>/js/corespring/core.js',
        '<%= common.dist %>/js/corespring/lodash-mixins.js']

    editor:
      dest: '<%= common.dist %>/js/prod-editor.js'
      concatDest: '.tmp/concat/js/editor.js'
      src: [
        '<%= common.dist %>/bower_components/angular-route/angular-route.min.js',
        '<%= common.dist %>/bower_components/angular-ui-router/release/angular-ui-router.min.js',
        '<%= common.dist %>/bower_components/mathjs/dist/math.min.js',
        '<%= common.dist %>/bower_components/saxjs/lib/sax.js',
        '<%= common.dist %>/js/corespring/core-library.js',
        '<%= common.dist %>/js/corespring/server/init-core-library.js',
        '<%= common.dist %>/js/editor/**/*.js',
        '<%= common.dist %>/js/catalog/**/*.js',
        '<%= common.dist %>/js/render/services/**/*.js',
        '<%= common.dist %>/js/render/directives/**/*.js',
        '<%= common.dist %>/js/render/controllers/**/*.js'
      ]

    editorExtras:
      dest: '<%= common.dist %>/js/prod-editor-extras.js'
      concatDest: '<%= common.dist %>/js/editor-extras.js'
      src: [
              '<%= common.dist %>/bower_components/select2/select2.js',
              '<%= common.dist %>/bower_components/angular-ui-select2/src/select2.js',
              '<%= common.dist %>/bower_components/angular-ui/build/angular-ui.min.js',
              '<%= common.dist %>/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
              '<%= common.dist %>/bower_components/bootstrap/js/dropdown.js',
              '<%= common.dist %>/bower_components/bootstrap/js/modal.js',
              '<%= common.dist %>/bower_components/bootstrap/js/tooltip.js',
              '<%= common.dist %>/bower_components/bootstrap/js/popover.js',
              '<%= common.dist %>/bower_components/angular-ui-ace/ui-ace.js',
              '<%= common.dist %>/bower_components/ace-builds/src-min-noconflict/ace.js',
              '<%= common.dist %>/bower_components/ace-builds/src-min-noconflict/theme-twilight.js',
              '<%= common.dist %>/bower_components/ace-builds/src-min-noconflict/mode-xml.js',
              '<%= common.dist %>/bower_components/ace-builds/src-min-noconflict/worker-json.js',
              '<%= common.dist %>/bower_components/ace-builds/src-min-noconflict/mode-json.js' ]

    catalog:
      dest: '<%= common.dist %>/js/catalog/prod-catalog.js'
      concatDest: '.tmp/concat/js/catalog.js'
      src: [
        '<%= common.dist %>/js/catalog/**/*.js'
      ]

  expandSrc = (arr) ->
    expanded = expand(arr)
    urls = _.map(expanded, toUrl)
    urls

  expand = (paths) ->
    out = expander(grunt)(paths, {common: common})
    out 

  toUrl = (p) -> 
    fileRoot = common.dist
    p
      .replace("#{fileRoot}/bower_components" , "../../components")
      .replace(fileRoot, "../..")

  pathsFor = (obj, name) ->
    name = "dest" unless name?
    filePaths =  if devMode then obj["src"] else [obj[name]] 
    expanded = expand(filePaths) 
    mapped = _.map( expanded, toUrl )
    mapped

 
  config =
    pkg: grunt.file.readJSON('package.json')
    common: common
    watch:
      options:
        livereload: true
        debounceDelay: 5000
        files: ['<%= common.dest %>/**/*']
      less:
        files: ['<%= common.app %>/**/*.less']
        tasks: ['copy:main', 'less:development']
      js:
        files: ['<%= common.app %>/js/**/*.js', '<%= common.components %>/**/*.js']
        tasks: ['jshint:main']
      jade:
        files: ['<%= common.app %>/**/*.jade']
        tasks: ['jade']


    copy:
      main:
        files: [{expand: true, cwd: '<%= common.app %>', src: ['./**/*.less'], dest: '<%= common.dist %>/'}]

    less:
      development:
        expand: true
        cwd: '<%= common.dist %>/css'
        src: '*.less'
        dest: '<%= common.dist %>/css/'
        ext: '.css'
        flatten: false
    clean:
      main: ["<%= common.dist %>/css/*.css"]

    shell:
      bowerCacheClean:
        command: 'bower cache clean'
      bower:
        command: 'bower install'
      mathjax_rm_pngs:
        command: 'rm -fr <%= common.dist %>/bower_components/mathjax/fonts/HTML-CSS/TeX/png'


    jshint:
      options: 
        jshintrc: '.jshintrc'
      main: ['<%= common.app %>/js/**/*.js', '!<%= common.app %>/**/*.min.js']

    jade:
      compile:
        expand: true
        cwd: '<%= common.app %>'
        src: ['**/*.jade', '!**/bower_components/**', '!layout.jade']
        ext: '.html'
        dest: '<%= common.dist %>'
        options:
          pretty: true
          data:
            devMode: grunt.option("devMode") != false  
            core: pathsFor(common.core) 
            coreLibs: pathsFor(common.coreLibs, "concatDest")
            editor: pathsFor(common.editor)
            editorExtras: pathsFor(common.editorExtras, "concatDest")
            player: pathsFor(common.player)
            catalog: pathsFor(common.catalog)

    jasmine:
      unit:
        src: [
          '<%= common.app %>/js/**/*.js', 
          '!<%= common.app %>/js/**/player-launcher/*.js',
          '<%= common.tmp %>/wrapped/**/*.js']
        options:
          keepRunner: true
          vendor: [
            '<%= common.dist %>/bower_components/angular/angular.js',
            '<%= common.dist %>/bower_components/angular-mocks/angular-mocks.js',
            '<%= common.dist %>/bower_components/wiggi-wiz/dist/wiggi-wiz.js',
            '<%= common.dist %>/bower_components/jquery/dist/jquery.js',
            '<%= common.dist %>/bower_components/lodash/dist/lodash.js'
            '<%= common.dist %>/bower_components/saxjs/lib/sax.js',
            '<%= common.dist %>/bower_components/angular-ui-bootstrap-bower/ui-bootstrap-tpls.js'
          ]
          specs: '<%= common.test %>/js/**/*-test.js'

    concat:
      generated:
        options: 
          separator: ";\n"
        files: [
          { 
            dest: common.core.concatDest 
            src: common.core.src 
          }
          { 
            dest: common.editor.concatDest
            src: common.editor.src
          }
          {
            dest: common.editorExtras.concatDest
            src: common.editorExtras.src
          }
          {
            dest: common.coreLibs.concatDest
            src: common.coreLibs.src
          }
          {
            dest: common.player.concatDest
            src: common.player.src
          }
          {
            dest: common.catalog.concatDest
            src: common.catalog.src
          }
        ]    

    uglify:
      generated:
        files: [ 
          { 
            dest:  common.core.dest,
            src: [ common.core.concatDest ] 
          }
          { 
            dest: common.editor.dest
            src: [ common.editor.concatDest ] 
          } 
          { 
            dest: common.player.dest
            src: [ common.player.concatDest ] 
          }
          {
            dest: common.catalog.dest
            src: [ common.catalog.concatDest ]
          }
        ] 

    compress: 
      generated: 
        options: 
          mode: 'gzip'
        files: [
          # Each of the files in the src/ folder will be output to
          # the dist/ folder each with the extension .gz.js
          { 
            expand: true 
            src: [ 
              common.core.dest, 
              common.editor.dest, 
              common.editorExtras.concatDest,
              common.player.dest,
              common.coreLibs.concatDest,
              common.catalog.concatDest ]
            ext: '.js.gz'
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
    'grunt-bower-clean'
  ]

  throwError = ->
    throw new Error("An error occured!")

  grunt.loadNpmTasks(t) for t in npmTasks
  grunt.registerTask('throwError', '', throwError )
  grunt.registerTask('loadComponentDependencies', 'Load client side dependencies for the components', componentDependencies(grunt))
  
  grunt.registerTask('restoreResolutions', 'Add "resolutions" back to bower.json', restoreResolutions(grunt))
  
  grunt.registerTask('clean_bower', 'bower_clean', 'shell:mathjax_rm_pngs')  
  # short cut
  grunt.registerTask('lcd', ['restoreResolutions', 'loadComponentDependencies'])
  grunt.registerTask('prepPlayerLauncher', 'prep the player launcher js', prepPlayerLauncher(grunt))
  grunt.registerTask('run', ['jade', 'less', 'watch'])
  grunt.registerTask('test', ['shell:bower', 'shell:bowerCacheClean', 'lcd', 'prepPlayerLauncher', 'jasmine:unit'])
  grunt.registerTask('default', ['shell:bower', 'lcd', 'clean_bower', 'jshint', 'concat', 'uglify', 'copy', 'less', 'jade', 'compress', 'prepPlayerLauncher','jasmine:unit'])
  grunt.registerTask('minify-test', ['concat', 'uglify'])