componentDependencies = require "./lib/component-dependencies"
expander = require "./lib/expander"
_ = require "lodash"

module.exports = (grunt) ->

  devMode = grunt.option("devMode") != false 

  common = 
    app: 'src/main/resources/container-client'
    dist: 'target/scala-2.10/classes/container-client'
    test: 'src/test/resources/container-client'
    components: '../../corespring-components/components'
    core: 
      dest: '<%= common.dist %>/js/prod-core.js'
      concatDest: '.tmp/concat/js/core.js'
      src: [
        '<%= common.dist %>/js/common/**/*.js', 
        '<%= common.dist %>/js/corespring/**/*.js']

    editor:
      dest: '<%= common.dist %>/js/prod-editor.js'
      concatDest: '.tmp/concat/js/editor.js'
      src: [
        '<%= common.dist %>/js/editor/**/*.js', 
        '<%= common.dist %>/js/render/services/**/*.js',
        '<%= common.dist %>/js/render/directives/**/*.js',
        '<%= common.dist %>/js/corespring/outcome-processor.js'
      ]

    editorExtras:
      dest: '<%= common.dist %>/js/prod-editor-extras.js'
      concatDest: '.tmp/concat/js/editor-extras.js'
      src: [
        '<%= common.dist %>/bower_components/angular-ui/build/angular-ui.js',
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

  toUrl = (p) -> 
    fileRoot = common.dist
    p
      .replace("#{fileRoot}/bower_components" , "/client/components")
      .replace(fileRoot, "/client")

  pathsFor = (obj) ->
    filePaths =  [obj["dest"]] # if devMode then obj["src"] else [obj["dest"]] 
    grunt.log.writeln(filePaths)
    expanded = expander(grunt)(filePaths, {common: common})
    _.map( expanded, toUrl )

 
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
        files: ['<%= common.app %>/*.jade']
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
      bower:
        command: 'bower install'

    jshint:
      jshintrc: '.jshintrc'
      main: ['<%= common.app %>/js/**/*.js']

    jade:
      compile:
        expand: true
        cwd: '<%= common.app %>'
        src: ['*.jade', '!layout.jade']
        ext: '.html'
        dest: '<%= common.dist %>'
        options:
          pretty: true
          data:
            devMode: grunt.option("devMode") != false  
            core: pathsFor(common.core) 
            editor: pathsFor(common.editor) 
            editorExtras: pathsFor(common.editorExtras) 

    jasmine:
      unit:
        src: '<%= common.app %>/js/**/*.js',
        options:
          keepRunner: true
          vendor: [
            '<%= common.dist %>/bower_components/angular/angular.js',
            '<%= common.dist %>/bower_components/angular-mocks/angular-mocks.js',
            '<%= common.dist %>/bower_components/jquery/jquery.js',
            '<%= common.dist %>/bower_components/lodash/dist/lodash.js'
          ]
          specs: '<%= common.test %>/js/**/*-test.js'

    concat:
      generated:
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
            dest: common.editorExtras.dest
            src: [ common.editorExtras.concatDest ] 
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
    'grunt-usemin'
  ]

  grunt.loadNpmTasks(t) for t in npmTasks
  grunt.registerTask('loadComponentDependencies', 'Load client side dependencies for the components', componentDependencies(grunt))
  
  grunt.registerTask('run', ['jade', 'less', 'watch'])
  grunt.registerTask('test', ['shell:bower', 'loadComponentDependencies', 'jasmine:unit'])
  grunt.registerTask('default', ['shell:bower', 'loadComponentDependencies', 'concat', 'uglify', 'less', 'jade', 'jasmine:unit'])
  grunt.registerTask('minify-test', ['concat', 'uglify'])