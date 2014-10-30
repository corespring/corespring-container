exports.define = function(isSecure) {
  var PlayerDefinition = function(element, options, errorCallback) {
    var errors = require("errors");
    var launcherErrors = require("launcher-errors");
    var launcherWarnings = require("launcher-warnings");

    options.queryParams = options.queryParams || require("query-params");

    var i;

    if(launcherWarnings.hasWarnings()){
      for (i = 0; i < launcherWarnings.warnings.length; i++) {
        if(console && console.warn && typeof(console.warn) === 'function'){
          console.warn(launcherWarnings.warnings[i]);
        }
      }
    }

    if (launcherErrors.hasErrors()) {
      for (i = 0; i < launcherErrors.errors.length; i++) {
        errorCallback(errors.EXTERNAL_ERROR(launcherErrors.errors[i]));
      }
      return;
    }

    var isReady = false;

    var defaultOptions = require("default-options");

    options = $.extend(defaultOptions, options);

    var validateOptions = function(options) {
      var out = [];

      if (!options.mode) {
        out.push(errors.INVALID_MODE);
        return out;
      }

      if (!options.itemId && !options.sessionId) {
        out.push(errors.NO_ITEM_OR_SESSION_ID);
      }
      if (!options.sessionId && options.mode !== "gather") {
        out.push(errors.NO_SESSION_ID);
      }
      return out;
    };

    var result = validateOptions(options);

    if (result.length > 0) {
      for (i = 0; i < result.length; i++) {
        errorCallback(result[i]);
      }
      return;
    }

    var InstanceDef = require("instance");

    var prepareUrl = function() {
      var id = options.mode === "gather" ? (options.sessionId || options.itemId) : options.sessionId;
      var path = options.paths[options.mode];
      if (options.mode === "gather" && options.sessionId) {
        path = options.paths.gatherSession;
      }
      return (options.corespringUrl + path).replace(":id", id);
    };

    options.url = prepareUrl();
    options.forceWidth = true;

    var instance = new InstanceDef(element, options, errorCallback);

    var isValidMode = function(m) {
      if (!m) {
        return false;
      }
      return ["gather", "view", "evaluate"].indexOf(m) !== -1;
    };

    var _isComplete = function(callback) {
      instance.sendMessage({
        message: "isComplete",
        property: "isComplete",
        callback: callback
      });
    };

    var isAllowed = function(mode, cb) {
      if (isSecure) {
        _isComplete(function(c) {
          if (mode === "evaluate" && !c) {
            cb(false);
          } else if (mode === "gather" && c) {
            cb(false);
          } else {
            cb(true);
          }
        });
      } else {
        cb(true);
      }
    };

    errorCallback = errorCallback || function(error) {
      throw "error occurred, code: " + error.code + ", message: " + error.message;
    };

    instance.addListener("launch-error", function(data) {
      var error = errors.EXTERNAL_ERROR(data.code + ": " + data.detailedMessage);
      errorCallback(error);
    });


    if (options.onSessionCreated) {
      instance.addListener("sessionCreated", function(data) {
        options.onSessionCreated(data.session._id.$oid);
      });
    }

    if (options.onInputReceived) {
      instance.addListener("inputReceived", function(data) {
        options.onInputReceived(data.sessionStatus);
      });
    }

    if (options.onPlayerRendered) {
      instance.addListener("rendered", function(data) {
        options.onPlayerRendered();
      });
    }

    var initialiseMessage = function(mode) {
      var modeOptions = options[mode] || {};
      var saveResponseOptions = mode === "evaluate" ? {
        isAttempt: false,
        isComplete: false
      } : null;
      instance.sendMessage({
        message: "initialise",
        data: {
          mode: mode,
          options: modeOptions,
          saveResponses: saveResponseOptions,
          queryParams: options.queryParams
        }
      });
    };
    
    var sendSetModeMessage = function(mode) {
      var modeOptions = options[mode] || {};
      var saveResponseOptions = mode === "evaluate" ? {
        isAttempt: false,
        isComplete: false
      } : null;
      instance.sendMessage({
        message: "setMode",
        data: {
          mode: mode,
          options: modeOptions,
          saveResponses: saveResponseOptions
        }
      });
    };

    /* API methods */
    this.setMode = function(mode, callback) {

      if (!isReady) {
        //no callback bc it results in a stack overflow
        return;
      }

      if (isValidMode(mode)) {
        isAllowed(mode, function(allowed) {
          if (allowed) {
            sendSetModeMessage(mode);
            if (callback) {
              callback(null);
            }
          } else {
            errorCallback(errors.NOT_ALLOWED);
            if (callback) {
              callback(errors.NOT_ALLOWED);
            }
          }
        });
      } else {
        errorCallback(errors.INVALID_MODE);
      }
    };

    this.saveResponses = function(isAttempt, callback) {
      instance.send('saveResponses', {isAttempt: isAttempt}, callback);
    };

    this.completeResponse = function(callback) {
      instance.send('completeResponse', callback);
    };

    this.resetItem = function() {
      instance.send("resetItem");
    };

    this.countAttempts = function(callback) {
      instance.sendMessage("countAttempts", callback);
    };

    this.getScore = function(format, callback) {
      instance.sendMessage( "getScore", {format: format || 'percent'}, callback);
    };

    this.getSessionStatus = function(callback) {
      instance.sendMessage( "getSessionStatus", callback);
    };

    this.isComplete = _isComplete;

    this.reset = function() {
      instance.sendMessage("reset");
    };

    this.remove = function() {
      instance.remove();
    };

    instance.addListener("ready", function(data) {
      isReady = true;
      initialiseMessage(options.mode);
    });

  };

  return PlayerDefinition;
};