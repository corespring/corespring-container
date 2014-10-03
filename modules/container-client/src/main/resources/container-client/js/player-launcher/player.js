exports.define = function(isSecure) {
  var PlayerDefinition = function(element, options, errorCallback) {

    var errors = require("errors");
    var launcherErrors = require("launcher-errors");

    options.queryParams = options.queryParams || require("query-params");

    var i;

    if (launcherErrors.hasErrors) {
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
      instance.sendMessage({
        message: "saveResponses",
        data: {
          isAttempt: isAttempt
        },
        callback: callback,
        property: "result"
      });
    };

    this.completeResponse = function(callback) {
      instance.sendMessage({
        message: "completeResponse",
        callback: callback,
        property: "result"
      });
    };

    this.resetItem = function() {
      instance.sendMessage({
        message: "resetSession"
      });
    };

    this.countAttempts = function(callback) {
      instance.sendMessage({
        message: "countAttempts",
        property: "count",
        callback: callback
      });
    };

    this.getScore = function(format, callback) {
      instance.sendMessage({
        message: "getScore",
        data: {
          format: format || 'percent'
        },
        property: "score",
        callback: callback
      });
    };

    this.getSessionStatus = function(callback) {
      instance.sendMessage({
        message: "getSessionStatus",
        property: "sessionStatus",
        callback: callback
      });
    };

    this.isComplete = _isComplete;

    this.reset = function() {
      instance.sendMessage({
        message: "resetSession"
      });
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