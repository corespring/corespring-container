componentDependencies = require "./lib/component-dependencies"
restoreResolutions = require "./lib/restore-resolutions"
prepPlayerLauncher = require "./lib/prep-player-launcher"
expander = require "./lib/expander"
pathReporter = require './lib/path-reporter'
_ = require "lodash"

playerConfig = require './grunt/config/player'


withDist = (d,s) -> "#{d}/#{s}"


module.exports = (grunt) ->

  #devMode = grunt.option("devMode") != false 


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

    ## Uglify - js concatenation, minification
    uglify:
      player:
        options:
          sourceMap:true
          sourceMapIncludeSource: true
          compress: false 
          mangle: false 
        files: [
          {
            src: _.map(playerConfig.src, withDist.bind(null,'<%= common.dist %>')) , 
            dest: withDist("<%= common.dist %>", playerConfig.dest)
          }
        ]

    compress: 
      player: 
        options: 
          mode: 'gzip'
        files: [
          { 
            expand: true 
            src: [ withDist("<%= common.dist %>", playerConfig.dest) ]
            ext: '.js.gz'
          }
        ]

    pathReporter: 
      player:
        src: _.map(playerConfig.src, withDist.bind(null,'<%= common.dist %>')) , 
        dest: withDist("<%= common.dist %>", playerConfig.dest) 
        report: '<%= common.dist %>/player-report.json'


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
  grunt.registerTask('stage', 'Work with the play stage task', 
    ['uglify', 'compress', 'pathReporter'])
###  grunt.registerTask('loadComponentDependencies', 'Load client side dependencies for the components', componentDependencies(grunt))
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
###
