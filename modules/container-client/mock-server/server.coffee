fs = require('fs')
http = require('http')
coffeeScript = require('coffee-script')
express = require('express')
logger = require('./web/log').logger(__filename)
_ = require('lodash')
hooks = require('./web/hooks')
templates = require('./web/templates')
directory = require('serve-index')
bodyParser = require('body-parser')

jsonPath = null
components = null
xhtml = null
components = require('./web/components')

app = express()

app.get '/client/player.html', (req, res) ->
  console.log req.query.json
  console.log req.query.components
  jsonPath = req.query.json
  componentsPath = req.query.components
  components.init(componentsPath)
  jsonContents = fs.readFileSync(jsonPath)
  xhtml = JSON.parse(jsonContents).xhtml
  console.log "jsonContents: #{jsonContents}"
  hooks.init('/client/player', app, components, jsonContents)
  res.sendfile("src/main/resources/container-client/player.html")

app.use('/client', directory('src/main/resources/container-client'))
app.use('/client', express.static('src/main/resources/container-client'))

config = (html, ngModules, scripts, css) ->
  xhtml: html
  angular:
    dependencies: ngModules
  scripts: scripts
  css: css

app.get '/client/mock-require.js', (req, res) -> res.sendfile('mock-server/web/mock-implementations/require.js')
app.get '/client/player-config.json', (req, res) ->

  deps = _.map components.all(), (c) -> templates.moduleName(c.organization, c.name)
  ngModules = ["mock.player.services"].concat(deps)
  scripts = ["mock-require.js", "player-services.js", "player-components.js"] #_.map(components.all, (c) -> c.client.render).join("\n")
  css = ["player-components.css"]
  res.json(config(xhtml, ngModules, scripts, css))

app.set('views', __dirname + '/web/views')
app.set('view engine', 'jade')
app.use(bodyParser())

port = process.env.PORT || 5000
app.set('port', port)

handler = -> logger.info "Express server listening on port " + port

http.createServer(app).listen(app.get('port'), handler )
