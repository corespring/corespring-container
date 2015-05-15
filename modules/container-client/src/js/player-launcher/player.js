exports.define = function(isSecure) {
  var PlayerDefinition = function(element, options, errorCallback) {

    var Launcher = require('client-launcher');
    var launcher = new Launcher(element, options, errorCallback);
    var errorCodes = require('error-codes');
    var instance = {
      send: function(){
        errorCallback(errorCodes.INSTANCE_NOT_READY);
      },
      on: function(){
        errorCallback(errorCodes.INSTANCE_NOT_READY);
      }
    };

    options.mode = options.mode || 'gather';

    /**
     * Utility that calls errorCallback if an error has occured.
     * If there has been no error,
     * then call the originalCallback with the result
     */
    function messageResultHandler(originalCallback){
      return function(err, result) {
        if(err){
          errorCallback(errorCodes.MESSAGE_ERROR(err));
        } else {
          originalCallback(result);
        }
      };
    }

    function isValidMode(m) {
      return ['gather', 'view', 'evaluate'].indexOf(m) !== -1;
    }

    function validateOptions(options){
      var out = [];
      
      //TODO - hook in bens object id util...

      if (!options.mode || !isValidMode(options.mode)) {
        out.push(errorCodes.INVALID_MODE);
        return out;
      }

      if (!options.itemId && !options.sessionId) {
        out.push(errorCodes.NO_ITEM_OR_SESSION_ID);
      }

      if (!options.sessionId && options.mode !== 'gather') {
        out.push(errorCodes.NO_SESSION_ID);
      }

      return out;
    }
    
    function prepareCall() {
      if(options.itemId){
        return launcher.loadCall('createSession', function(url){
          return url.replace(':id', options.itemId);
        }); 
      } else {
        options.mode = options.mode || 'gather';
        return launcher.loadCall(options.mode, function(url){
          return url.replace(':sessionId', options.sessionId);
        }); 
      }
    }

    var initOk = launcher.init(validateOptions);

    if(initOk){
      var call = prepareCall();

      var params = options.queryParams; 
      var initialData = {mode: options.mode};
      initialData[options.mode] = options[options.mode] || {};
      
      instance = launcher.loadInstance(call, params, initialData);

      var forceWidth = options.forceWidth === undefined ? true : options.forceWidth;
      
      if(forceWidth){
        instance.width(options.width || '600px');
      }

      if (options.onSessionCreated) {
        instance.on('sessionCreated', function(data) {
          options.onSessionCreated(data.session.id);
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
    } else {
      return;
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
    
    var sendSetModeMessage = function(mode) {
      var saveResponseOptions = mode === 'evaluate' ? {
        isAttempt: false,
        isComplete: false
      } : null;
      instance.send('setMode', {
        mode: mode,
        saveResponses: saveResponseOptions
      });
    };

    /* API methods */
    this.setMode = function(mode, callback) {

      if (!launcher.isReady) {
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
            errorCallback(errorCodes.NOT_ALLOWED);
            if (callback) {
              callback(errorCodes.NOT_ALLOWED);
            }
          }
        });
      } else {
        errorCallback(errorCodes.INVALID_MODE);
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

    /** @deprecated use 'reset()' */
    this.resetItem = function() {
      this.reset();
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
      instance.send('resetSession');
      this.setMode('gather');
    };

    this.remove = function() {
      instance.remove();
    };
      
  };

  return PlayerDefinition;
};
