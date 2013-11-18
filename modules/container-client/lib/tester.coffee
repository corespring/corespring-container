module.exports = (grunt) ->
  ->
    grunt.log.writeln(">> tester..")
    grunt.log.writeln(">> ", grunt.config("common.core"))

    core = grunt.config("common.core")

    all_core = grunt.file.expand(core.src)
    grunt.log.writeln(">> ", all_core)