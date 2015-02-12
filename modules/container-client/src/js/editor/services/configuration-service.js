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
          callback(config);
        } catch (err) {
          $log.error("Error in callback", err);
        }
      });
    };

    this.getConfig = function(callback) {
      if (configHasBeenSet) {
        callback(config);
      } else {
        callbacks.push(callback);
      }
    };

  }

})();


