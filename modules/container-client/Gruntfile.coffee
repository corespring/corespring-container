componentDependencies = require "./lib/component-dependencies"
restoreResolutions = require "./lib/restore-resolutions"
prepPlayerLauncher = require "./lib/prep-player-launcher"
expander = require "./lib/expander"
_ = require "lodash"

module.exports = (grunt) ->

  devMode = grunt.option("devMode") != false 

  apps = ["**/editor.jade", "**/*player.jade", "**/*catalog.jade"]
  ignoreApps = _.map apps, (a) -> "!#{a}"


  jadeConfig = (path, ext, dev) ->

    ext = ".html" unless ext?

    expand: true
    cwd: '<%= common.app %>'
    src: path.concat(['!**/bower_components/**', '!*layout.jade'])
    ext: ext 
    dest: '<%= common.dist %>'
    options:
      pretty: true
      data:
        devMode: dev
        core: pathsFor(common.core, dev) 
        coreLibs: pathsFor(common.coreLibs, dev)
        editor: pathsFor(common.editor, dev)
        editorExtras: pathsFor(common.editorExtras, dev)
        player: pathsFor(common.player, dev)
        catalog: pathsFor(common.catalog, dev)
        catalogExtras: pathsFor(common.catalogExtras, dev)


  common = 
    app: 'src/main/resources/container-client'
    dist: 'target/scala-2.10/classes/container-client'
    test: 'src/test/resources/container-client'
    tmp: '.tmp'
    components: '../../corespring-components/components'
    player: 
      src:  [
        '<%= common.dist %>/js/render/**/*.js' ]
      dest: '<%= common.dist %>/js/prod-player.js'

    coreLibs: 
      src: [
        '<%= common.dist %>/bower_components/es5-shim/es5-shim.min.js',
        '<%= common.dist %>/bower_components/console-polyfill/index.js',
        '<%= common.dist %>/bower_components/jquery/dist/jquery.min.js',
        '<%= common.dist %>/bower_components/jquery-ui/ui/jquery-ui.js',
        '<%= common.dist %>/bower_components/angular/angular.min.js',
        '<%= common.dist %>/bower_components/lodash/dist/lodash.min.js',
        '<%= common.dist %>/bower_components/angular-ui-sortable/sortable.js',
        '<%= common.dist %>/bower_components/mathjs/dist/math.min.js',
        '<%= common.dist %>/bower_components/saxjs/lib/sax.js'
      ]
      dest: '<%= common.dist %>/js/core-libs.js'

    core: 
      dest: '<%= common.dist %>/js/prod-core.js'
      src: [
        '<%= common.dist %>/bower_components/corespring-ng-components/build/corespring-ng-components.js',
        '<%= common.dist %>/js/corespring/core.js',
        '<%= common.dist %>/js/corespring/core-library.js',
        '<%= common.dist %>/js/corespring/server/init-core-library.js',
        '<%= common.dist %>/js/corespring/lodash-mixins.js',
        '<%= common.dist %>/js/common/**/*.js']


    catalog: 
      dest: '<%= common.dist %>/js/prod-catalog.js'
      src: [
        '<%= common.dist %>/js/corespring/core-library.js',
        '<%= common.dist %>/js/corespring/server/init-core-library.js',
        '<%= common.dist %>/js/catalog/**/*.js',
        '<%= common.dist %>/js/render/services/**/*.js',
        '<%= common.dist %>/js/render/directives/**/*.js',
        '<%= common.dist %>/js/render/controllers/**/*.js',
        # needed for client side player
        '<%= common.dist %>/js/editor/designer/score-processor.js'
      ]

    catalogExtras: 
      dest: '<%= common.dist %>/js/prod-catalog-extras.js'
      src: [
        '<%= common.dist %>/bower_components/angular-route/angular-route.min.js',
        '<%= common.dist %>/bower_components/angular-ui-router/release/angular-ui-router.min.js',
      ]

    editor:
      dest: '<%= common.dist %>/js/prod-editor.js'
      src: [
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
      src: [
              '<%= common.dist %>/bower_components/angular-route/angular-route.min.js',
              '<%= common.dist %>/bower_components/angular-ui-router/release/angular-ui-router.min.js',
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
              '<%= common.dist %>/bower_components/ace-builds/src-min-noconflict/mode-json.js',
              '<%= common.dist %>/bower_components/jquery.browser/dist/jquery.browser.min.js']

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

  pathsFor = (obj, dev) ->
    name = "dest"
    filePaths =  if dev then obj["src"] else [obj[name]] 
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
      uglified: [ common.core.dest, common.coreLibs.dest, common.catalog.dest, common.catalogExtras.dest, common.editor.dest, common.editorExtras.dest]

    shell:
      bowerCacheClean:
        command: 'node node_modules/bower/bin/bower cache clean'
        options :
          failOnError: true
      bower:
        command: 'node node_modules/bower/bin/bower install'
        options :
          failOnError: true
      bowerUpdate:
        command: 'node node_modules/bower/bin/bower update'
        options :
          failOnError: true
      mathjax_rm_pngs:
        command: 'rm -fr <%= common.dist %>/bower_components/mathjax/fonts/HTML-CSS/TeX/png'
        options :
          failOnError: true

    jshint:
      options: 
        jshintrc: '.jshintrc'
      main: ['<%= common.app %>/js/**/*.js', '!<%= common.app %>/**/*.min.js']


    jade:
      partials: jadeConfig(["**/*.jade"].concat(ignoreApps), ".html", false)
      prod: jadeConfig(apps, ".prod.html", false )
      dev: jadeConfig(apps, ".dev.html", true )

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
          '<%= common.tmp %>/wrapped/**/*.js'
          '!<%= common.app %>/js/**/player-launcher/*.js']
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

    uglify:
      concatOnly:
        options: 
          sourceMap: false
          mangle: false
          compress: false
        files: [
          common.coreLibs,
          common.editorExtras,
          common.catalogExtras
        ]

      minifyAndConcat: 
        options:
          sourceMap:true
          compress: true
          mangle: true
        files: [
          common.core,
          common.editor,
          common.player,
          common.catalog
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
              common.editorExtras.dest,
              common.catalog.dest, 
              common.player.dest,
              common.coreLibs.dest,
              common.catalog.dest ]
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
  grunt.registerTask('run', ['clean:uglified', 'uglify', 'jade', 'less', 'watch'])
  grunt.registerTask('test', ['shell:bower', 'shell:bowerCacheClean', 'lcd', 'prepPlayerLauncher', 'jasmine:unit'])
  grunt.registerTask('default', ['shell:bower', 'lcd', 'clean_bower', 'clean:uglified', 'jshint', 'uglify', 'copy', 'less', 'jade', 'compress', 'prepPlayerLauncher','jasmine:unit'])
  grunt.registerTask('minify-test', ['concat', 'uglify'])