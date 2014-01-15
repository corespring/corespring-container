globule = require "globule"
_ = require "lodash"
fs = require "fs"
sys = require('sys')
bower = require('bower')


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

    # target - may be undefined (if so ues the bower default target)
    # version - may be undefined (if so use the bower default version)
    bowerInstall = (name, target, version, done) ->


      grunt.log.writeln(" bowerInstall > #{name}, #{target}, #{version}")
      #done()
      #return

      bowerName = ->
        out = "#{name}"
        out += "=#{target}" if target
        out += "\##{version}" if version and version != "latest"
        out

      args = [] 
      #args.push("-F")
      args.push("-V")
      args.push(bowerName())

      exec = require('child_process').exec
      cmd = "bower install #{args.join(" ")}"
      grunt.log.debug("  bowerInstall cmd: #{cmd}")
      exec cmd, {cwd: '.'}, (err, stdout, stderr) ->
        grunt.log.debug(stdout)
        grunt.log.writeln("bowerInstall > done: #{name}")
        
        if err?
          grunt.fail.warn( "#{name} \n #{err}")

        done()
      
    done = @async()

    if !grunt.config("common.components")
      grunt.fail.warn("No 'components' path specified!")
      return

    compPath = grunt.config("common.components")
    grunt.log.debug(compPath)
    
    filepaths = globule.find "#{compPath}/**/package.json"

    defsObject = _.chain(filepaths)
      .map(fileToJson)
      .map(pluckClient)
      .reduce( mergeItems, {})
      .value()

    defs = _.pairs(defsObject)

    grunt.log.debug(JSON.stringify(defs, null, "  "))

    ###
    Recursively call bower for each definition so they are executed serially.
    ###
    runInstall = (defs, installationDone) ->

      if defs? && defs[0]?
        d = defs.shift()
        name = d[0]
        target = d[1].bower_target
        version = d[1].version
        grunt.log.writeln("|| runInstall :: #{name} --> #{target} --> #{version}")
        bowerInstall name, target, version, ->
          grunt.log.writeln("|| Finished > runInstall :: #{name} --> #{target} --> #{version}")
          grunt.log.writeln("")
          runInstall(defs, installationDone)
      else
        installationDone()

    runInstall(defs, done)


