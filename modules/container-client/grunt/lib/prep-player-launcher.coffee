_ = require "lodash"
path = require "path"
fs = require "fs"
mkdirp = require 'mkdirp'

###
Depends on the corespring core.js 
###
template = (name, contents) ->
  """
  (function(exports, require, module){
    #{contents}
  })(corespring.module("#{name}").exports, corespring.require, corespring.module("#{name}"));
  """

module.exports = (grunt) ->

  ###
  For each js file in 'src', wrap it and concat all to the 'dest'.
  ###
  grunt.registerMultiTask 'prepPlayerLauncher', 'Wrap player js so that exports and require will work', ->
  
      readAndWrap = (p) ->
        js = grunt.file.read(p, {encoding:  'utf-8'})
        name = path.basename(p, ".js")
        template(name, js)

      writeWrapped = (f) ->
        grunt.log.debug('src', JSON.stringify(f.src))
        grunt.log.debug('dest', JSON.stringify(f.dest))
        sumString = (sum, s) -> sum += "\n\n#{readAndWrap(s)}"
        wrapped = _.reduce(f.src, sumString, "")
        grunt.file.write(f.dest, wrapped)

      @files.forEach(writeWrapped)
