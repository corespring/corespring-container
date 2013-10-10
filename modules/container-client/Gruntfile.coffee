module.exports = (grunt) ->

  commonConfig =
    app: 'src/main/resources/container-client'
    dist: 'target/scala-2.10/classes/container-client'

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
    less:
      development:
        expand: true
        cwd: '<%= common.app %>/css'
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



  grunt.initConfig(config)

  npmTasks = [
    'grunt-shell',
    'grunt-contrib-copy',
    'grunt-contrib-uglify',
    'grunt-contrib-concat',
    'grunt-contrib-clean',
    'grunt-contrib-less',
    'grunt-contrib-watch',
    'grunt-contrib-jshint'
  ]

  grunt.loadNpmTasks(t) for t in npmTasks
  grunt.registerTask('run', ['less', 'watch'])

  grunt.registerTask('default', ['shell:bower','less'])
