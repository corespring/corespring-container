function ClientLauncher(element, options, errorCallback){
  
  /** error and warning handler */
  function ErrorAndWarningHandler(){
    var errs = require('launcher-errors');

    this.hasErrors = function(){
      return errs.errors.length === 0;
    };

    this.eachError = function(cb){
      for(var i = 0; i < errs.length; i++){
        cb(errs.errors[i]);
      }
    };

    this.eachWarning = function(cb){
      var launchWarnings;
      try{
        launchWarnings = require('launcher-warnings');
      } catch(e){
        launchWarnings = { warnings : [] };
      }
      for(var i = 0; i < launchWarnings.warnings.length; i++){
        cb(launchWarnings.warnings[i]);
      }
    };
  }
  
  function Paths(){

    var options = require('default-options');

    this.corespringUrl = options.corespringUrl;
    
    this.loadCall = function(key){
      if (!options.paths || !options.paths[key]) {
        errorCallback({
          code: 105,
          message: key + ' not part of options'
        });
        return null;
      }
      return options.paths[key];
    };
  }

  var errors = require('errors');
  var logger = options.logger || require('logger');
  var builder = new (require('url-builder'))();
  var queryParams = $.extend({}, require('query-params'), options.queryParams);
  var InstanceDef = require('instance');
  
  errorCallback = errorCallback || function (error) {
    throw 'error occurred, code: ' + error.code + ', message: ' + error.message;
  };

  this.paths = new Paths();
  this.isReady = false;

  this.loadCall = function(key, urlProcessor){
    urlProcessor = urlProcessor || function(u){return u;};
    var c = this.paths.loadCall(key);
    return { method: c.method, url: urlProcessor( this.paths.corespringUrl + c.url)};
  };


  this.prepareUrl = function(u, opts){
    opts = opts || {};
    return builder.build(u, $.extend(queryParams, opts));
  };

  function triggerErrorCallback(e){
    errorCallback(errors.EXTERNAL_ERROR(e));
  }

  this.init = function(validateOptions){
    var handler = new ErrorAndWarningHandler();

    handler.eachWarning(logger.warn);

    if(!handler.hasErrors()){
      handler.eachError(triggerErrorCallback);
      return false;
    }

    var validationResults = validateOptions ? validateOptions(options) : [];

    if (validationResults.length > 0) {
      for(var x = 0; x < validationResults.length; x++){
        errorCallback(validationResults[x]);
      }
      return false;
    }
    return true;
  };


  /**
   * @param call an object or a string. 
   *   if an object: must have the form: { method: '', url: ''}
   *   if a string: it'll be converted into { method: '', url: ''}
   * @param params an object of params to pass when launching
   * @param initialData an object that will be sent to the instance 'initialise' handler
   * @param onReady called when instance is ready - function(instance){};
   */
  this.loadInstance = function(call, params, initialData, onReady){

    call = (typeof(call) === 'string') ? { method: 'GET', url: call} : call;
    params = params || {};

    var instance = new InstanceDef($.extend(call, {params: params}), element, errorCallback, logger);

    instance.on('launch-error', function (data) {
      var error = errors.EXTERNAL_ERROR(data.code + ': ' + data.detailedMessage);
      errorCallback(error);
    });

    var readyHandler = function(){
      logger.info('instance is ready');
      if (this.isReady) {
        instance.removeChannel();
        errorCallback(errors.EDITOR_NOT_REMOVED);
      } else {
        this.isReady = true;
        instance.send('initialise', initialData);
        if(onReady){
          onReady(instance);
        }
      }
    };

    instance.on('ready', readyHandler.bind(this));
    return instance;
  };
}

module.exports = ClientLauncher;
