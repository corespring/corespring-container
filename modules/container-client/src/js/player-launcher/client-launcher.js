function ClientLauncher(element, options, errorCallback){

    /** called to load the iframe, launch errors have been checked */
    this.loadClient = function(){
      throw new Error('must be overridden');
    };

    errorCallback = errorCallback || function (error) {
      throw 'error occurred, code: ' + error.code + ', message: ' + error.message;
    };

    var isReady = false;
    var errors = require('errors');
    var logger = options.logger || require('logger');
    var builder = new (require('url-builder'))();
    var paths = new (require('paths'))(function(e){
      errorCallback(e);
    });

    this.log = logger.log;

    var queryParams = $.extend({}, require('query-params'), options.queryParams);

    this.prepareUrl = function(u, opts){
      opts = opts || {};
      return builder.build(u, $.extend(queryParams, opts));
    };

    this.loadCall = function(key){
      return paths.loadMethodAndUrl(key);
    };

    var InstanceDef = require('instance');

    this.mkInstance = function(url, onReady){
      var instance = new InstanceDef(element, {
        url: url,
        queryParams: queryParams
      }, errorCallback, logger);

      instance.on('launch-error', function (data) {
        var error = errors.EXTERNAL_ERROR(data.code + ': ' + data.detailedMessage);
        errorCallback(error);
      });

      instance.on('ready', function() {
        if (isReady) {
          instance.removeChannel();
          errorCallback(errors.EDITOR_NOT_REMOVED);
        } else {
          isReady = true;
          instance.send('initialise', options);
          onReady(instance);
        }
      });
    };


    function notifyClient(e){
      errorCallback(errors.EXTERNAL_ERROR(e));
    }

    this.init = function(){

      var errorHandler = require('error-handler');

      if(!errorHandler.hasErrors()){
        errorHandler.each(notifyClient);
        return;
      }

      this.loadClient();
    };

}

module.exports = ClientLauncher;
