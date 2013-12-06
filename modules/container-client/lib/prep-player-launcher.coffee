_ = require "lodash"
path = require "path"
fs = require "fs"
mkdirp = require 'mkdirp'


module.exports = (grunt) ->
  
  template = (name, contents) ->
    """
    (function(exports, require, module){
      #{contents}
    })(corespring.module("#{name}").exports, corespring.require, corespring.module("#{name}"));
    """
  
  ->

    grunt.log.writeln("prep player launcher")
    common = grunt.config("common")
    
    processed = grunt.template.process(
      "<%= common.app %>/**/player-launcher/*.js",
      data:
        common: common
    )

    filesToWrap = grunt.file.expand({ nonull: true }, processed)

    _.map filesToWrap, (p) ->
      grunt.log.writeln(p)
      name = path.basename(p, ".js") 
      contents = fs.readFileSync(p)
      wrapped = template(name, contents)
      basePath = "#{common.tmp}/wrapped"
      mkdirp.sync basePath
      fs.writeFileSync("#{basePath}/#{name}-wrapped.js", wrapped)




