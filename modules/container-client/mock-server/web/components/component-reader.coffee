logger = require('../log').logger(__dirname)
path = require 'path'
fs = require 'fs'
coffeeScript = require 'coffee-script'

class ClientDef
  constructor: (@render, @configure) ->

class ComponentDef
  constructor: (@organization, @name, @client, @server, @pkg) ->
    @componentType = "#{@organization}-#{@name}"

# private
orgName = (p) ->
  dir = path.dirname(p)
  basename = path.basename(dir)
  basename

componentName = (p) -> path.basename(p)

load = (folders ...) ->
  logger.debug "folders: ", folders
  p = path.join.apply(null, folders)
  logger.debug ">>> p:", p

  if fs.existsSync("#{p}.js")
    logger.debug "found js"
    fs.readFileSync("#{p}.js", 'utf8')
  else if fs.existsSync("#{p}.coffee")
    logger.debug "found coffee"
    coffeeSrc = fs.readFileSync("#{p}.coffee", 'utf8')
    js = coffeeScript.compile coffeeSrc, { bare : true }
    logger.debug js
    js

clientDef = (p) ->
  renderJs = load(p, 'src', 'client', 'render')
  configJs = load(p, 'src', 'client', 'configure')
  new ClientDef(renderJs, configJs)

requireServer = (folders ...) ->
  p = path.join.apply(null, folders)

  if fs.existsSync(p)
    api: require path.join(process.cwd(), p)
    contents: loadJsFromSrc("#{p}/index.js")
  else
    render: (q) -> q
    respond: (question, answer, settings) -> { message: "No respond function defined - please implement one for: #{p}" }

loadJsFromSrc = (jsPath) ->
  return fs.readFileSync(jsPath, 'utf8') if fs.existsSync(jsPath)
  coffeePath = jsPath.replace(".js", ".coffee")
  toJs(coffeePath)

toJs = (coffeePath) ->
  if fs.existsSync(coffeePath)
    coffeeSrc = fs.readFileSync(coffeePath, 'utf8')
    coffeeScript.compile coffeeSrc, { bare : true }
  else
    ""

serverDef = (p) -> requireServer(p, 'src', 'server')

pkg = (p) ->
  logger.info "pkg ::", p
  require path.join( process.cwd(), p, 'package.json')

###
  Parse a folder structure into a component definition
###
exports.fromFolder = (p, done) ->

  throw new Error("You need to specify a callback for fromFolder") if !done?

  done("[component-reader] Folder: #{p} doesn't exist") if !fs.existsSync(p)

  org = orgName(p)
  comp = componentName(p)
  cl = clientDef(p)
  srvr = serverDef(p)
  pk = pkg(p)

  def = new ComponentDef(org, comp, cl, srvr, pk)

  done(null, def)

