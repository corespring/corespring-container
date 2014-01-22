fs = require "fs"


###
  See: 
    https://www.pivotaltracker.com/s/projects/926438/stories/64173060
    And:
    https://github.com/bower/bower/issues/1061
    
    Bower removes resolutions that it thinks is unnecessary.
    However we have commands that depend on the resolutions remaining in place.

    This task restores them if necessary.
###
module.exports = (grunt) -> 
  ->

    logJson = (json, level = "debug") -> 
      grunt.log[level](JSON.stringify(json, null, 2))


    bowerJson = require "../bower.json"
    
    res = 
      angular: "~1.2.8"

    logJson(bowerJson.resolutions, "writeln")

    needsUpdate = bowerJson.resolutions == null || bowerJson.resolutions == undefined

    done = @async()

    if needsUpdate
      grunt.log.writeln("need to update ../bower.json")
      bowerJson.resolutions = res 

      out = JSON.stringify(bowerJson, null, 2)
      
      fs.writeFile "bower.json", out, (err) ->
        grunt.log.writeln("write file done..")
        if err
          console.log(err)
         else 
          console.log("JSON saved")
        done()

    else 
      grunt.log.writeln("../bower.json resolutions is ok")
      logJson(bowerJson, "debug")
      done()
