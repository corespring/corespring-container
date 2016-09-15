/**
 *
 * @param {Object} options - {
 *   launchInitTimeout - how long to wait for the underlying instance to be ready before invoking the `errorCallback` with INITIALISATION_FAILED.
 *      If not defined it'll use `launchConfig.initTimeout` as the default.
 * }
 *
 */
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
      return errors.length > 0;
    };

    this.eachError = function(cb){
      for(var i = 0; i < errors.length; i++){
        cb(errors[i]);
      }
    };

    this.eachWarning = function(cb){
      for(var i = 0; i < warnings.length; i++){
        cb(warnings[i]);
      }
    };
  }
  
  function Paths(pathsConfig){

    /** 
     * Get nested values by dot delimited string.
     * this.get('a.b.c', '??');
     */
    function NestedGetter(obj){

      function getValueByArray(obj, parts, value){

        if(!parts) {
          return value;
        }

        if(parts.length === 1){
          return obj[parts[0]];
        } else {
          var next = parts.shift();

          if(!obj[next]){
            return value;
          }
          return getValueByArray(obj[next], parts, value);
        }
      }

      this.get = function(path, defaultValue){
        return getValueByArray(obj, path.split('.')) || defaultValue;
      };
    }

    this.corespringUrl = launchConfig.corespringUrl || '';
    
    var getter = new NestedGetter(pathsConfig);
    
    this.loadCall = function(key){

      if (!pathsConfig) {
        errorCallback(errorCodes.CANT_FIND_URL('can not find url for key: ' + key));
        return null;
      }

      var result = getter.get(key, 'not-found');

      if(result === 'not-found'){
        errorCallback(errorCodes.CANT_FIND_URL('can not find url for key: ' + key));
        return null;
      }
      return result;
    };
  }

  this.paths = new Paths(launchConfig.paths);
  this.isReady = false;

  this.loadCall = function(key, urlProcessor){
    urlProcessor = urlProcessor || function(u){return u;};
    var c = this.paths.loadCall(key);
    if(c){
      return { 
        key: key,
        method: c.method, 
        url: urlProcessor(this.paths.corespringUrl + c.url),
        queryParams: this.buildParams(options.queryParams || {})
      };
    } else {
      return {key: key};
    }
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

    if(handler.hasErrors()){
      handler.eachError(triggerErrorCallback);
      return false;
    }

    var validationResults = validateOptions ? validateOptions(options) : [];

    if (validationResults && validationResults.length > 0) {
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
   * @param queryParams an object of queryParams to pass when launching
   * @param initialData an object that will be sent to the instance 'initialise' handler
   * @param onReady called when instance is ready - function(instance){};
   */
  this.loadInstance = function(call, queryParams, initialData, onReady, customVariables){

    call = (typeof(call) === 'string') ? {method: 'GET', url: call} : call;
    
    queryParams = this.buildParams(queryParams);
    if (customVariables) {
      queryParams = queryParams || {};
      queryParams.colors = window.btoa(JSON.stringify({colors: customVariables.colors}));
      queryParams.iconSet = customVariables.iconSet;
    }

    var initTimeout = isNaN(options.launchInitTimeout) ?
      (isNaN(launchConfig.initTimeout) ? 0 : launchConfig.initTimeout) :
      options.launchInitTimeout;

    var launchOpts = {
      initTimeout: initTimeout,
      call: call,
      queryParams: queryParams, 
      data: initialData};
    
    var instance = new InstanceDef(
      launchOpts,
      element,
      errorCallback,
      logger,
      options.autosizeEnabled,
      options.iframeScrollingEnabled,
      undefined,
      options.scrollContainer);

    instance.on('launch-error', function (data) {
      var error = errorCodes.EXTERNAL_ERROR(data.code + ': ' + data.detailedMessage);
      errorCallback(error);
    });

    var readyHandler = (function(){
      logger.info('instance is ready');

      if (this.isReady) {
        instance.removeChannel();
        errorCallback(errorCodes.EDITOR_NOT_REMOVED);
      } else {
        this.isReady = true;
        if (options.onClientReady) {
          options.onClientReady();
        }
        if(onReady){
          onReady(instance);
        }
      }
    }).bind(this);

    instance.on('ready', function(){
      readyHandler();
    });
    return instance;
  };
}

module.exports = ClientLauncher;
