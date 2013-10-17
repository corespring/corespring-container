module.exports = (grunt) ->

  commonConfig =
    app: 'src/main/resources/container-client'
    dist: 'target/scala-2.10/classes/container-client'
    test: 'src/test/resources/container-client'

  config =
    pkg: grunt.file.readJSON('package.json')
    common: commonConfig
    watch:
      less:
        files: ['<%= common.app %>/**/*.less']
        tasks: ['less']
      js:
        files: ['<%= common.app %>/js/**/*.js']
        tasks: ['jshint:main']
      jade:
        files: ['<%= common.app %>/*.jade']
        tasks: ['jade']

    less:
      development:
        expand: true
        cwd: '<%= common.dist %>/css'
        src: '*.less'
        dest: '<%= common.dist %>/css/'
        ext: '.css'
        flatten: false
        filter: 'isFile'
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
            debug: false

    jasmine:
      unit:
        src: '<%= common.app %>/js/**/*.js',
        options:
          keepRunner: true
          vendor: [
            '<%= common.dist %>/bower_components/angular/angular.js',
            '<%= common.dist %>/bower_components/angular-mocks/angular-mocks.js',
            '<%= common.dist %>/bower_components/jquery/jquery.js',
          ]
          specs: '<%= common.test %>/js/**/*-test.js'





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
    'grunt-contrib-jasmine'
  ]

  grunt.loadNpmTasks(t) for t in npmTasks
  grunt.registerTask('run', ['jade', 'less', 'watch'])
  grunt.registerTask('test', ['shell:bower', 'jasmine:unit'])
  grunt.registerTask('default', ['shell:bower','less', 'jade', 'jasmine:unit'])
