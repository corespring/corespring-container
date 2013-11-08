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

runCmd = (cmd, args, end) ->

  console.log("#{cmd} #{args.join(" ")}")

  spawn = require('child_process').spawn
  child = spawn(cmd, args)
  response = ""
  child.stdout.on 'data', (buffer) -> response += buffer
  child.stderr.on 'data', (buffer) -> response += buffer
  child.stdout.on 'end', () -> end(response.toString())


mergeItems = (accumulator, obj) -> _.merge(accumulator, obj)

module.exports = (grunt) ->
  ->


    bowerInstall = (name, target, done) ->

      args = if target == "latest" then "-F #{name}" else "-F #{name}=#{target}"

      runCmd "bower", ["install",  args], (response) ->
        grunt.log.writeln(response)
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



