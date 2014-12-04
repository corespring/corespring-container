exports.define = function(isSecure) {
  var PlayerDefinition = function(element, options, errorCallback) {

    errorCallback = errorCallback || function(error) {
      throw "error occurred, code: " + error.code + ", message: " + error.message;
    };

    var errors = require('errors');
    var launcherErrors = require('launcher-errors');
    var launcherWarnings = require('launcher-warnings');

    options.queryParams = options.queryParams || require('query-params');

    options = $.extend(require('default-options'), options);

    var logger = options.logger || require('logger');

    function forEach(arr, fn){
      if(typeof fn === 'function'){
        for(var i = 0; i < arr.length; i++){
          fn(arr[i]);
        }
      }
    }

    if(launcherWarnings.hasWarnings()){
      forEach(launcherWarnings.warnings, logger.warn);
    }

    if (launcherErrors.hasErrors() && errorCallback) {
      forEach(launcherErrors.errors, function(e){errorCallback(errors.EXTERNAL_ERROR(e)); });
      return;
    }

    var isReady = false;


    var validateOptions = function(options) {
      var out = [];

      if (!options.mode) {
        out.push(errors.INVALID_MODE);
        return out;
      }

      if (!options.itemId && !options.sessionId) {
        out.push(errors.NO_ITEM_OR_SESSION_ID);
      }
      if (!options.sessionId && options.mode !== 'gather') {
        out.push(errors.NO_SESSION_ID);
      }
      return out;
    };

    var result = validateOptions(options);

    if (result.length > 0) {
      forEach(result, errorCallback);
      return;
    }

    var InstanceDef = require('instance');

    var prepareUrl = function() {
      var id = options.mode === 'gather' ? (options.sessionId || options.itemId) : options.sessionId;
      var path = options.paths[options.mode];
      if (options.mode === 'gather' && options.sessionId) {
        path = options.paths.gatherSession;
      }
      return (options.corespringUrl + path).replace(':id', id);
    };

    options.url = prepareUrl();
    options.forceWidth = true;

    var instance = new InstanceDef(element, options, errorCallback, logger);

    var isValidMode = function(m) {
      switch(m){
        case 'gather':
        case 'view':
        case 'evaluate':
          return true;
      }
      return false;
    };

    /**
     * Utility that calls errorCallback if an error has occured.
     * If there has been no error,
     * then call the originalCallback with the result
     */
    function messageResultHandler(originalCallback){
      return function(err, result) {
        if(err){
          errorCallback(errors.MESSAGE_ERROR(err));
        } else {
          originalCallback(result);
        }
      };
    }

    var _isComplete = function(callback) {
      instance.send( 'isComplete', messageResultHandler(callback));
    };

    var isAllowed = function(mode, cb) {
      if (isSecure) {
        _isComplete(function(c) {
          if (mode === 'evaluate' && !c) {
            cb(false);
          } else if (mode === 'gather' && c) {
            cb(false);
          } else {
            cb(true);
          }
        });
      } else {
        cb(true);
      }
    };

    /*
    //TODO - is this still in use?
    instance.on('launch-error', function(data) {
      var error = errors.EXTERNAL_ERROR(data.code + ': ' + data.detailedMessage);
      errorCallback(error);
    });*/

    if (options.onSessionCreated) {
      instance.on('sessionCreated', function(data) {
        options.onSessionCreated(data.session._id.$oid);
      });
    }

    if (options.onInputReceived) {
      instance.on('inputReceived', function(sessionStatus) {
        options.onInputReceived(sessionStatus);
      });
    }

    if (options.onPlayerRendered) {
      instance.on('rendered', function(data) {
        options.onPlayerRendered();
      });
    }

    var initialiseMessage = function(mode) {
      var modeOptions = options[mode] || {};
      var saveResponseOptions = mode === 'evaluate' ? {
        isAttempt: false,
        isComplete: false
      } : null;

      instance.send( 'initialise', {
        mode: mode,
        options: modeOptions,
        saveResponses: saveResponseOptions,
        queryParams: options.queryParams
      });
    };

    var sendSetModeMessage = function(mode) {
      var modeOptions = options[mode] || {};
      var saveResponseOptions = mode === 'evaluate' ? {
        isAttempt: false,
        isComplete: false
      } : null;
      instance.send('setMode', {
        mode: mode,
        options: modeOptions,
        saveResponses: saveResponseOptions
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
      instance.send('saveResponses', {isAttempt: isAttempt}, function(err, session){
        callback({error: err, session: session});
      });
    };

    this.completeResponse = function(callback) {
      instance.send('completeResponse', callback);
    };

    this.resetItem = function() {
      instance.send('resetItem');
    };

    this.countAttempts = function(callback) {
      instance.send('countAttempts', messageResultHandler(callback));
    };

    this.getScore = function(format, callback) {
      instance.send(
        'getScore',
      {format: format || 'percent'},
      messageResultHandler(callback) );
    };

    this.getSessionStatus = function(callback) {
      instance.send( 'getSessionStatus', messageResultHandler(callback));
    };

    this.isComplete = _isComplete;

    this.reset = function() {
      instance.send('reset');
    };

    this.remove = function() {
      instance.remove();
    };

    instance.on('ready', function() {
      function throwOrWarn(msg){
        if(options.strict){
          throw(msg);
        } else {
          logger.warn(msg);
        }
      }
      if( isReady ) {
        instance.removeChannel();
        errorCallback(errors.PLAYER_NOT_REMOVED);
      } else {
        isReady = true;
        initialiseMessage(options.mode);
      }
    });

  };

  return PlayerDefinition;
};
