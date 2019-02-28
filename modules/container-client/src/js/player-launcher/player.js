exports.define = function(isSecure) {



/////////////// Lifted from lodash //
function isObject(value) {
  const type = typeof value
  return value != null && (type == 'object' || type == 'function')
}

function debounce(func, wait, options) {
  var lastArgs,
    lastThis,
    maxWait,
    result,
    timerId,
    lastCallTime

  var lastInvokeTime = 0
  var leading = false
  var maxing = false
  var trailing = true

  var root = window;

  // Bypass `requestAnimationFrame` by explicitly setting `wait=0`.
  var useRAF = (!wait && wait !== 0 && typeof root.requestAnimationFrame === 'function')

  if (typeof func !== 'function') {
    throw new TypeError('Expected a function')
  }

  wait = +wait || 0
  //!! isObject
  if (isObject(options)) {
    leading = !!options.leading
    maxing = 'maxWait' in options
    maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : maxWait
    trailing = 'trailing' in options ? !!options.trailing : trailing
  }

  function invokeFunc(time) {
    var args = lastArgs
    var thisArg = lastThis

    lastArgs = lastThis = undefined
    lastInvokeTime = time
    result = func.apply(thisArg, args)
    return result
  }

  function startTimer(pendingFunc, wait) {
    if (useRAF) {
      root.cancelAnimationFrame(timerId);
      return root.requestAnimationFrame(pendingFunc)
    }
    return setTimeout(pendingFunc, wait)
  }

  function cancelTimer(id) {
    if (useRAF) {
      return root.cancelAnimationFrame(id)
    }
    clearTimeout(id)
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time
    // Start the timer for the trailing edge.
    timerId = startTimer(timerExpired, wait)
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result
  }

  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime
    const timeWaiting = wait - timeSinceLastCall

    return maxing
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime
    const timeSinceLastInvoke = time - lastInvokeTime

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait))
  }

  function timerExpired() {
    const time = Date.now()
    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }
    // Restart the timer.
    timerId = startTimer(timerExpired, remainingWait(time))
  }

  function trailingEdge(time) {
    timerId = undefined

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time)
    }
    lastArgs = lastThis = undefined
    return result
  }

  function cancel() {
    if (timerId !== undefined) {
      cancelTimer(timerId)
    }
    lastInvokeTime = 0
    lastArgs = lastCallTime = lastThis = timerId = undefined
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(Date.now())
  }

  function pending() {
    return timerId !== undefined
  }

  function debounced(...args) {
    var time = Date.now()
    var isInvoking = shouldInvoke(time)

    lastArgs = args
    lastThis = this
    lastCallTime = time

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime)
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = startTimer(timerExpired, wait)
        return invokeFunc(lastCallTime)
      }
    }
    if (timerId === undefined) {
      timerId = startTimer(timerExpired, wait)
    }
    return result
  }
  debounced.cancel = cancel
  debounced.flush = flush
  debounced.pending = pending
  return debounced
}

////////////////

  /** IE8 Support */
  /* jshint ignore:start */
  if (!Array.prototype.indexOf)
  {
    Array.prototype.indexOf = function(elt /*, from*/)
    {
      var len = this.length >>> 0;

      var from = Number(arguments[1]) || 0;
      from = (from < 0)
           ? Math.ceil(from)
           : Math.floor(from);
      if (from < 0)
        from += len;

      for (; from < len; from++)
      {
        if (from in this &&
            this[from] === elt)
          return from;
      }
      return -1;
    };
  }
  /* jshint ignore:end */

  function buildFn(fn, wait) {
    if(fn) {
      if(Number.isFinite(wait)){
        var w = Math.max(0, Math.min(1500, wait));
        return debounce(fn, w, {leading: false, trailing: true});
      }
    }
  }

  var PlayerDefinition = function(element, options, errorCallback) {
    options = options || {};

    var debounceOpts = Object.assign({
      saveResponses: 500,
      onInputReceived: 500
    }, options.debounce);

    options.onInputReceived = buildFn(options.onInputReceived, debounceOpts.onInputReceived);

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
      return ['gather', 'view', 'evaluate', 'instructor'].indexOf(m) !== -1;
    }

    function requiresSessionId(m) {
      return ['view', 'evaluate'].indexOf(m) !== -1;
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

      if (!options.sessionId && requiresSessionId(options.mode)) {
        out.push(errorCodes.NO_SESSION_ID);
      }

      return out;
    }

    function prepareCall() {
      if(options.sessionId){
        options.mode = options.mode || 'gather';
        return launcher.loadCall(options.mode, function(url){
          return url.replace(':sessionId', options.sessionId);
        });
      } else if(options.itemId){
        return launcher.loadCall('createSession', function(url){
          return url.replace(':id', options.itemId);
        });
      }
    }


    function buildModeData(mode){
      var data = {mode: mode};
      data[mode] = options[mode] || {};
      return data;
    }


    var initOk = launcher.init(validateOptions);

    if(initOk){
      var call = prepareCall();

      var params = options.queryParams;
      var initialData = buildModeData(options.mode);

      instance = launcher.loadInstance(call, params, initialData, undefined, options.customVariables);

      if (options.width) {
        instance.width(options.width);
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

    var isProtectedMode = function(mode) {
      return ["evaluate","instructor"].indexOf(mode) >= 0;
    };

    var isAllowed = function(mode, cb) {
      if (isSecure) {
        _isComplete(function(c) {
          if (isProtectedMode(mode) && !c) {
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
      var data = buildModeData(mode);

      if(mode === 'evaluate'){
        data.saveResponses = { isAttempt: false, isComplete: false };
      }

      instance.send('setMode', data);
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

    this.saveResponses = buildFn(function(isAttempt, callback) {
      instance.send('saveResponses', {isAttempt: isAttempt}, function(err, session){
        callback({error: err, session: session});
      });
    }, debounceOpts.saveResponses);

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
      instance.send('getSessionStatus', messageResultHandler(callback));
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
