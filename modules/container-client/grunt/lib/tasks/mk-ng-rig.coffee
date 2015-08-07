_ = require('lodash')
jade = require('jade')
path = require('path')
fs = require('fs')

###
Generates an empty html page with all the js and css loaded into it so you can create a little rig for a directive or what have you.
###
module.exports = (grunt) ->
  grunt.registerMultiTask 'mkNgRig', 'Create a ng rig', ->
    opts = @options()

    jsReport = require( process.cwd() + '/' + @data.js.report.replace('.json', ''))
    cssReport = require( process.cwd() + '/' + @data.css.report.replace('.json', ''))

    jsSrc = _.map(jsReport.libs.concat(jsReport.src), @data.js.expand)
    cssSrc = _.map(cssReport.libs.concat(cssReport.src), @data.css.expand)

    console.log(cssSrc)

    locals =
      js: jsSrc
      css: cssSrc 
      ngModules: JSON.stringify(jsReport.ngModules)
      pretty: true

    grunt.log.debug('locals', locals)
    fileOutName = grunt.option('ng-rig-name') || 'my-ng-rig.html'
    html = jade.renderFile( path.join(__dirname, 'ng-rig-template.jade'), locals); 
    fs.writeFileSync(fileOutName, html, {encoding: 'utf8'})