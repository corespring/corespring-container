function ClientLauncher(element, options, errorCallback){

    /** called to load the iframe, launch errors have been checked */
    this.loadClient = function(){
      throw new Error('must be overridden');
    };

    /** return an array of errors after inspecting the options */
    this.validateOptions = function(options){
      return [];
    };

    errorCallback = errorCallback || function (error) {
      throw 'error occurred, code: ' + error.code + ', message: ' + error.message;
    };

    this.isReady = false;
    var errors = require('errors');
    var logger = options.logger || require('logger');
    var builder = new (require('url-builder'))();
    var paths = new (require('paths'))(function(e){
      errorCallback(e);
    });

    this.log = function(){
      logger.log.apply(logger, Array.prototype.slice(arguments));
    };

    var queryParams = $.extend({}, require('query-params'), options.queryParams);

    this.prepareUrl = function(u, opts){
      opts = opts || {};
      return builder.build(u, $.extend(queryParams, opts));
    };

    this.loadCall = function(key){
      return paths.corespringUrl + paths.loadCall(key);
    };

    var InstanceDef = require('instance');

    /**
     * Create the Iframe Instance.
     * If you implement onReady you must send the 'initialise' message.
     */
    this.mkInstance = function(url, opts, onReady){

      opts = opts || {};

      var instanceOpts = $.extend(opts, {
        url: url,
        queryParams: queryParams
      });

      var instance = new InstanceDef(element, instanceOpts, errorCallback, logger);

      instance.on('launch-error', function (data) {
        var error = errors.EXTERNAL_ERROR(data.code + ': ' + data.detailedMessage);
        errorCallback(error);
      });

      var readyHandler = function(){
        if (this.isReady) {
          instance.removeChannel();
          errorCallback(errors.EDITOR_NOT_REMOVED);
        } else {
          this.isReady = true;
          if(onReady){
            onReady(instance);
          } else {
            instance.send('initialise', options);
          }
        }
      };

      instance.on('ready', readyHandler.bind(this));

      return instance;
    };

    function triggerErrorCallback(e){
      errorCallback(errors.EXTERNAL_ERROR(e));
    }

    function ErrorAndWarningHandler(){
      var errs = require('launcher-errors');
      var launchWarnings = require('launcher-warnings');

      this.hasErrors = function(){
        return errs.errors.length === 0;
      };

      this.eachError = function(cb){
        for(var i = 0; i < errs.length; i++){
          cb(errs.errors[i]);
        }
      };

      this.eachWarning = function(cb){
        for(var i = 0; i < launchWarnings.warnings.length; i++){
          cb(launchWarnings.warnings[i]);
        }
      };
    }

    this.init = function(){
      var handler = new ErrorAndWarningHandler();

      handler.eachWarning(logger.warn);

      if(!handler.hasErrors()){
        handler.eachError(triggerErrorCallback);
        return;
      }

      var validationResults = this.validateOptions ? this.validateOptions(options) : [];

      if (validationResults.length > 0) {
        for(var x = 0; x < validationResults.length; x++){
          errorCallback(validationResults[x]);
        }
        return;
      }

      this.loadClient();
    };

}

module.exports = ClientLauncher;
