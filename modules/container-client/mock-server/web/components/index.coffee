###
Component Registry
load all the comps to make them available elsewhere in the app.
###

logger = require('../log').logger(__dirname)
fs = require 'fs'
path = require 'path'
_ = require 'lodash'
reader = require './component-reader'

loadedComponents = {}
loaded = false

Regex = /(.*?)\-(.*)/

isValidOrgName = (n) ->
  return false if !n?
  m = n.match /^[a-z0-9_-]+$/
  m?

###
  Load all available components into the container
###
exports.init = (folder) ->
  logger.info "init - loaded?", loaded

  # TODO: Allow reloading of components?
  if loaded and process.env["NODE_ENV"] == "production"
    throw new Error("already loaded")
  else
    loaded = true

    orgs = _.filter fs.readdirSync(folder), isValidOrgName

    logger.debug "orgs: ", orgs

    orgsAndComps = _.map orgs, (org) ->
      children = fs.readdirSync( path.join(folder, org) )
      clean = _.filter children, isValidOrgName
      _.map clean, (comp) -> path.join(folder, org, comp)

    logger.info "orgs and comps",  "./#{orgsAndComps}"

    # Load common dependencies first
    commonDeps = ['drag-and-drop-engine']

    flattened = _.sortBy (_.flatten orgsAndComps), (comp) ->
      f = _.find commonDeps, (dep) ->
        comp.indexOf(dep) >= 0
      f == undefined ? 0 : 1

    loadedComponents = []

    _.each flattened, (p) ->
      reader.fromFolder "./#{p}", (err, def) ->
        loadedComponents.push(def)

    logger.debug "--> loaded components", _.map(loadedComponents, (c) -> "#{c.organization}/#{c.name}")

exports.loaded = -> loaded
###
Return all loaded components
###
exports.all = -> loadedComponents

exports.defSync = (componentType) ->
  logger.info "def: #{componentType}"
  [all, org, name] = componentType.match /(.*?)\-(.*)/

  foundComp = _.find loadedComponents, (def) ->
    def.organization == org and def.name == name

  if foundComp?
    foundComp
  else
    throw new Error("[components] Can't find component: #{componentType}")

###
  Return a component definition for the unique type id
###
exports.def = (componentType, done) ->
  comp = @defSync(componentType)
  done(null, comp)

