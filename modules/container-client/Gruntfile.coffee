module.exports = (grunt) ->

  commonConfig =
    app: 'src/main/resources/container-client'
    dist: 'src/main/resources/container-client'

  config =
    pkg: grunt.file.readJSON('package.json')
    common: commonConfig
    watch:
      less:
        files: ['<%= common.app %>/**/*.less']
        tasks: ['less']
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


  grunt.initConfig(config)

  npmTasks = [
    'grunt-shell',
    'grunt-contrib-copy',
    'grunt-contrib-uglify',
    'grunt-contrib-concat',
    'grunt-contrib-clean',
    'grunt-contrib-less',
    'grunt-contrib-watch'
  ]

  grunt.loadNpmTasks(t) for t in npmTasks
  grunt.registerTask('run', ['less', 'watch'])

  grunt.registerTask('default', ['shell:bower','less'])
