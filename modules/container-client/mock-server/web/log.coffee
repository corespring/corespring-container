winston = require 'winston'
path = require 'path'
loggers = {}

exports.logger = (category) ->


  category = path.basename category, ".coffee", ".js"
  #console.log "[logger] for: ", category

  if !loggers[category]?

    winston.loggers.add category,
      console:
        level: 'debug'
        colorize: 'true'
        label: category

  loggers[category] = winston.loggers.get category
  loggers[category]

