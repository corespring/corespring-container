componentDependencies = require "./lib/component-dependencies"
restoreResolutions = require "./lib/restore-resolutions"
prepPlayerLauncher = require "./lib/prep-player-launcher"
expander = require "./lib/expander"
_ = require "lodash"

module.exports = (grunt) ->

  devMode = grunt.option("devMode") != false 

  apps = ["**/editor.jade", "**/*player.jade", "**/*catalog.jade"]
  ignoreApps = _.map apps, (a) -> "!#{a}"


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

  srcDest = (key) ->
    src: sources[key]
    dest: destinations[key]

  pathsFor = (key, dev) ->
    obj = srcDest(key)
    name = "dest"
    filePaths =  if dev then obj["src"] else [obj[name]]
    
    grunt.log.debug("---------------> expand for: #{key}") 

    expanded = expand(filePaths) 
    mapped = _.map( expanded, toUrl )
    mapped

  # Build a jade config object
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
        core: pathsFor("core", dev) 
        coreLibs: pathsFor("coreLibs", dev)
        editor: pathsFor("editor", dev)
        editorExtras: pathsFor("editorExtras", dev)
        player: pathsFor("player", dev)
        catalog: pathsFor("catalog", dev)
        catalogExtras: pathsFor("catalogExtras", dev)

  # Some common vars
  common = 
    app: 'src/main/resources/container-client'
    dist: 'target/scala-2.10/classes/container-client'
    test: 'src/test/resources/container-client'
    tmp: '.tmp'
    components: '../../corespring-components/components'
  
  destinations = 
    player: '<%= common.dist %>/js/prod-player.js'
    rootPlayer: '<%= common.dist %>/js/root-prod-player.js'
    coreLibs: '<%= common.dist %>/js/core-libs.js'
    core: '<%= common.dist %>/js/prod-core.js'
    catalog: '<%= common.dist %>/js/prod-catalog.js'
    catalogExtras: '<%= common.dist %>/js/prod-catalog-extras.js'
    editor: '<%= common.dist %>/js/prod-editor.js'
    editorExtras: '<%= common.dist %>/js/prod-editor-extras.js'


  sources = 
    player: [ '<%= common.dist %>/js/render/**/*.js' ]

    coreLibs: [
      '<%= common.dist %>/bower_components/es5-shim/es5-shim.min.js',
      '<%= common.dist %>/bower_components/console-polyfill/index.js',
      '<%= common.dist %>/bower_components/jquery/dist/jquery.min.js',
      '<%= common.dist %>/bower_components/jquery-ui/jquery-ui.min.js',
      '<%= common.dist %>/bower_components/angular/angular.min.js',
      '<%= common.dist %>/bower_components/lodash/dist/lodash.min.js',
      '<%= common.dist %>/bower_components/angular-ui-sortable/sortable.min.js',
      '<%= common.dist %>/bower_components/mathjs/dist/math.min.js',
      '<%= common.dist %>/bower_components/saxjs/lib/sax.js',
      '<%= common.dist %>/bower_components/bootstrap/dist/js/bootstrap.min.js'
    ]

    core: [
      '<%= common.dist %>/bower_components/corespring-ng-components/build/corespring-ng-components.js',
      '<%= common.dist %>/js/corespring/core.js',
      '<%= common.dist %>/js/corespring/core-library.js',
      '<%= common.dist %>/js/corespring/server/init-core-library.js',
      '<%= common.dist %>/js/corespring/lodash-mixins.js',
      '<%= common.dist %>/js/common/**/*.js']

    catalog: [
      '<%= common.dist %>/js/corespring/core-library.js',
      '<%= common.dist %>/js/corespring/server/init-core-library.js',
      '<%= common.dist %>/js/catalog/**/*.js',
      '<%= common.dist %>/js/render/services/**/*.js',
      '<%= common.dist %>/js/render/directives/**/*.js',
      '<%= common.dist %>/js/render/controllers/**/*.js',
      '<%= common.dist %>/js/common/services/message-bridge.js'
    ]

    catalogExtras: [ 
      '<%= common.dist %>/bower_components/angular-route/angular-route.min.js',
      '<%= common.dist %>/bower_components/angular-ui-router/release/angular-ui-router.min.js']

    editor: [
      '<%= common.dist %>/js/corespring/core-library.js',
      '<%= common.dist %>/js/corespring/server/init-core-library.js',
      '<%= common.dist %>/js/editor/**/*.js',
      '<%= common.dist %>/js/catalog/**/*.js',
      '<%= common.dist %>/js/render/services/**/*.js',
      '<%= common.dist %>/js/render/directives/**/*.js',
      '<%= common.dist %>/js/render/controllers/**/*.js' ]

    editorExtras: [
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
      '<%= common.dist %>/bower_components/jquery.browser/dist/jquery.browser.min.js',
      '<%= common.dist %>/bower_components/undo.js/undo.js']

    rootPlayer: [destinations.coreLibs, destinations.core, destinations.player]



 
  config =
    pkg: grunt.file.readJSON('package.json')
    common: common
    watch:
      options:
        livereload: true
        debounceDelay: 5000
        files: ['<%= common.dist %>/**/*']
      less:
        files: ['<%= common.app %>/**/*.less']
        tasks: ['copy:main', 'less:development']
      componentLess:
        files: ['<%= common.components %>/**/*.less']
        tasks: ['runComponentLess']
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

      production: 
        options: 
          cleancss: true 
        expand: true
        cwd: '<%= common.dist %>/css'
        src: '*.less'
        dest: '<%= common.dist %>/css/'
        ext: '.min.css'
        flatten: false

    
    clean:
      main: ["<%= common.dist %>/css/*.css"]
      uglified: _.toArray(destinations)
      less: ['<%= common.dist %>/css/**/*.less']
      gzip: _.map(_.toArray(destinations),(dest) -> dest + '.gz')
      map: _.map(_.toArray(destinations),(dest) -> dest.replace('.js','.map'))

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
      mathjax_rm_fonts:
        command: """
        rm -fr <%= common.dist %>/bower_components/mathjax/**/*.otf\n
        rm -fr <%= common.dist %>/bower_components/mathjax/**/*.eot\n
        """
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

    ejs:
      prod: 
        options: 
          scripts: [pathsFor("rootPlayer", false)]
        src: ['**/*.jade.ejs']
        cwd: '<%= common.app %>'
        dest: '<%= common.dist %>'
        expand: true
        ext: '.jade'


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
            '<%= common.dist %>/bower_components/bootstrap/dist/js/bootstrap.min.js',
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
          srcDest("coreLibs"),
          srcDest("editorExtras"),
          srcDest("catalogExtras")
        ]

      minifyAndConcat: 
        options:
          sourceMap:true
          compress: true
          mangle: true
        files: [
          srcDest("core"),
          srcDest("editor"),
          srcDest("player"),
          srcDest("catalog")
        ]

      prodPlayer: 
        options:
          sourceMap:false
          compress: false
          mangle: false 
        files: [
          {src: sources.rootPlayer, dest: destinations.rootPlayer}
        ] 

    compress: 
      generated: 
        options: 
          mode: 'gzip'
        files: [
          { 
            expand: true 
            src: _.toArray(destinations)
            ext: '.js.gz'
          }
        ]
      css: 
        options: 
          mode: 'gzip'
        files: [
          {
            expand: true 
            src: ['<%= common.dist %>/css/*.css', '!<%= common.dist %>/css/*.min.css'] 
            ext: '.css.gz'
          }
          {
            expand: true 
            src: ['!<%= common.dist %>/css/*.css', '<%= common.dist %>/css/*.min.css'] 
            ext: '.min.css.gz'
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

  throwError = ->
    throw new Error("An error occured!")

  grunt.loadNpmTasks(t) for t in npmTasks
  grunt.registerTask('throwError', '', throwError )
  grunt.registerTask('loadComponentDependencies', 'Load client side dependencies for the components', componentDependencies(grunt))
  
  grunt.registerTask('restoreResolutions', 'Add "resolutions" back to bower.json', restoreResolutions(grunt))
  
  grunt.registerTask('clean_bower', ['bower_clean', 'shell:mathjax_rm_pngs', 'shell:mathjax_rm_fonts'])  
  # short cut
  grunt.registerTask('lcd', ['restoreResolutions', 'loadComponentDependencies'])
  grunt.registerTask('prepPlayerLauncher', 'prep the player launcher js', prepPlayerLauncher(grunt))
  grunt.registerTask('run', ['uglification', 'ejs', 'jade', 'runComponentLess', 'less', 'watch'])
  grunt.registerTask('test', ['shell:bower', 'shell:bowerCacheClean', 'lcd', 'prepPlayerLauncher', 'jasmine:unit'])
  grunt.registerTask('uglification', ['clean:uglified', 'uglify:concatOnly', 'uglify:minifyAndConcat', 'uglify:prodPlayer'])
  grunt.registerTask('default', ['shell:bower', 'lcd', 'jshint', 'uglification', 'ejs', 'copy', 'less', 'clean:less', 'runComponentLess', 'clean_bower', 'jade', 'compress', 'prepPlayerLauncher','jasmine:unit'])
  grunt.registerTask('minify-test', ['concat', 'uglify'])
  grunt.registerTask('ejs-test', ['ejs'])

  grunt.registerTask('runComponentLess', ->
    cb = @async()
    grunt.util.spawn(
      grunt: true, args: [ 'less' ]
      opts:
        cwd: common.components
    , (error, result, code) ->
      console.log result.stdout
      cb()
    )
  )
