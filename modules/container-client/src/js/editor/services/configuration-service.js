(function () {

  "use strict";

  /**
   * Give access to the configuration that is passed to the instance
   * It is set in the root controller and can be used by any other controller
   */
  angular.module('corespring-editor.services')
    .service('ConfigurationService',
    [
      'LogFactory',
      ConfigurationService
    ]
  );

  function ConfigurationService(LogFactory) {

    var $log = LogFactory.getLogger('ConfigurationService');

    var config = null;
    var configHasBeenSet = false;

    var callbacks = [];

    this.setConfig = function(value) {
      $log.log('setConfig', value);
      config = value;
      configHasBeenSet = true;
      _.forEach(callbacks, function(callback) {
        try {
          callback(new NestedGetter(config));
        } catch (err) {
          $log.error("Error in callback", err);
        }
      });
    };

     function NestedGetter(obj){

      function getValueByArray(obj, parts, value){

        if(!parts) {
          return null;
        }

        if(parts.length === 1){
          return obj[parts[0]];
        } else {
          var next = parts.shift();

          if(!obj[next]){
            return null;
          }
          return getValueByArray(obj[next], parts, value);
        }
      }

      this.get = function(path, defaultValue){
        return getValueByArray(obj, path.split('.')) || defaultValue;
      };
    }

    this.getConfig = function(callback) {
      if (configHasBeenSet) {
        callback(new NestedGetter(config));
      } else {
        callbacks.push(callback);
      }
    };

  }

})();


