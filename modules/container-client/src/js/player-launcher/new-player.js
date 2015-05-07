exports.define = function(isSecure) {
  var PlayerDefinition = function(element, options, errorCallback) {

    var Launcher = require('new-client-launcher');
    var launcher = new Launcher(element, options, errorCallback);
    var errors = require('errors');
    var instance = {
      send: function(){
        errorCallback(errors.INSTANCE_NOT_READY);
      },
      on: function(){
        errorCallback(errors.INSTANCE_NOT_READY);
      }
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

    function validateOptions(options){
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
    }
    
    function prepareCall() {
      options.mode = options.mode || 'gather';
      var id = options.mode === 'gather' ? (options.sessionId || options.itemId) : options.sessionId;
      var call = launcher.loadCall('gather', function(url){
        return url.replace(':itemId', id);
      }); 
      return call;
    }

    var initOk = launcher.init(validateOptions);

    if(initOk){
      var call = prepareCall();
      var params = options.queryParams; 
      var initialData = {mode: options.mode};
      initialData[options.mode] = options[options.mode] || {};
      
      console.debug('initial data: ', initialData);

      instance = launcher.loadInstance(call, params, initialData);

      var forceWidth = options.forceWidth === undefined ? true : options.forceWidth;
      
      if(forceWidth){
        instance.width(options.width || '600px');
      }

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
    } else {
      return;
    }
      
    function isValidMode(m) {
      return ['gather', 'view', 'evaluate'].indexOf(m) !== -1;
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
