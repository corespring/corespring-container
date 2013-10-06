_ = require 'lodash'
templates = require './templates'
fs = require 'fs'

servicesPath = 'mock-server/web/mock-implementations/player-services.js'
componentRegisterPath = 'mock-server/web/mock-implementations/component-register.js'

exports.init = (path, app, components, mockData) ->

  serverSideLogic = _.map components.all(), (c) ->
    templates.wrapInMockComponentRegister(c.organization, c.name, c.server.contents)

  app.get "#{path}-services.js", (req,res) ->
    fs.readFile servicesPath, (err, services) ->
      fs.readFile componentRegisterPath, (err, register) ->
        out = [
            templates.wrapMockData(mockData),
            services,
            register,
            serverSideLogic.join(";\n")].join("\n")

        res.set('Content-Type', 'text/javascript').send(out)

  app.get "#{path}-components.css", (req,res) ->
    res.send("...")

  app.get "#{path}-components.js", (req,res) ->
    out = _.map components.all(), (c) ->
      templates.wrapComponent(c.organization, c.name, c.client.render)
    res.set('Content-Type', 'text/javascript').send(out.join("\n"))
