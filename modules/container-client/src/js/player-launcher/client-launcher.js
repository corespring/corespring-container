function ClientLauncher(element, options, errorCallback){
  
  var launchConfig = require('launch-config');
  var errorCodes = require('error-codes');
  var logger = options.logger || require('logger');
  var UrlBuilder = require('url-builder');
  var InstanceDef = require('instance');
  
  errorCallback = errorCallback || function (error) {
    throw 'error occurred, code: ' + error.code + ', message: ' + error.message;
  };
  
  /** error and warning handler */
  function ErrorAndWarningHandler(errors, warnings){

    errors = errors || [];
    warnings = warnings || [];

    this.hasErrors = function(){
      return errors.length === 0;
    };

    this.eachError = function(cb){
      for(var i = 0; i < errors.length; i++){
        cb(errors.errors[i]);
      }
    };

    this.eachWarning = function(cb){
      for(var i = 0; i < warnings.length; i++){
        cb(warnings[i]);
      }
    };
  }
  
  
  function Paths(pathsConfig){

    this.corespringUrl = launchConfig.corespringUrl;
    
    this.loadCall = function(key){
      if (!pathsConfig || !pathsConfig[key]) {
        errorCallback({
          code: 105,
          message: key + ' not part of paths config'
        });
        return null;
      }
      return pathsConfig[key];
    };
  }

  this.paths = new Paths(launchConfig.paths);
  this.isReady = false;

  this.loadCall = function(key, urlProcessor){
    urlProcessor = urlProcessor || function(u){return u;};
    var c = this.paths.loadCall(key);
    return { method: c.method, url: urlProcessor( this.paths.corespringUrl + c.url)};
  };

  this.buildParams = function(p){
    return $.extend(launchConfig.queryParams, p);
  };

  this.prepareUrl = function(u, params){
    params = this.buildParams(params); 
    return new UrlBuilder(u).params(params).build(); 
  };

  function triggerErrorCallback(e){
    errorCallback(errorCodes.EXTERNAL_ERROR(e));
  }

  this.init = function(validateOptions){
    var handler = new ErrorAndWarningHandler(launchConfig.errors, launchConfig.warnings);

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
    params = this.buildParams(params); 
    var instance = new InstanceDef($.extend(call, {params: params}), element, errorCallback, logger);

    instance.on('launch-error', function (data) {
      var error = errorCodes.EXTERNAL_ERROR(data.code + ': ' + data.detailedMessage);
      errorCallback(error);
    });

    var readyHandler = function(){
      logger.info('instance is ready');
      if (this.isReady) {
        instance.removeChannel();
        errorCallback(errorCodes.EDITOR_NOT_REMOVED);
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
