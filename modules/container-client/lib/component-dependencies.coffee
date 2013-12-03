globule = require "globule"
_ = require "lodash"
fs = require "fs"
sys = require('sys')
exec = require('child_process').exec


puts = (error, stdout, stderr) -> 
  sys.puts(stderr)
  sys.puts(error)
  sys.puts(stdout)


fileToJson = (p) -> 
  contents = fs.readFileSync(p)
  JSON.parse(contents)

pluckClient = (obj) ->
  if obj.dependencies and obj.dependencies.client 
    obj.dependencies.client 
  else 
    {}

mergeItems = (accumulator, obj) -> _.merge(accumulator, obj)

module.exports = (grunt) ->
  ->

    bowerInstall = (name, target, done) ->
      args = if target == "latest" then "-F -V #{name}" else "-F -V #{name}=#{target}"
      exec = require('child_process').exec
      cmd = "bower install #{args}"
      grunt.log.writeln("running: #{cmd}")
      exec cmd, {cwd: '.'}, (err, stdout, stderr) ->
        grunt.log.writeln(stdout)
        grunt.log.writeln(stderr)
        grunt.log.writeln("-------------> done: #{name}")
        done()

    done = @async()


    if !grunt.config("common.components")
      grunt.fail.warn("No 'components' path specified!")
      return

    compPath = grunt.config("common.components")
    grunt.log.writeln(compPath)
    filepaths = globule.find "#{compPath}/**/package.json"

    defs = _.chain(filepaths)
      .map(fileToJson)
      .map(pluckClient)
      .reduce( mergeItems, {})
      .value()


    grunt.log.writeln(JSON.stringify(defs))


    installationDone = _.after _.keys(defs).length,  ->
      done()

    _.forIn defs, (v,name) -> 
      target = v.bower_target
      bowerInstall(name, target, installationDone)



