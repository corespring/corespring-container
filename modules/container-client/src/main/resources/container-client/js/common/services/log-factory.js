angular.module('corespring-common.services').service('LogFactory', [
  '$log',
  function($log) {

    function LogFactory() {

      /**
       * Return a logger that uses "[id] - " to start logging messages
       * @param id
       */
      this.getLogger = function(id){
        var prefix = "[" + id + "] - ";
        var logger = {
          log: $log.log.bind($log, prefix),
          info: $log.info.bind($log, prefix),
          warn: $log.warn.bind($log, prefix),
          error: $log.error.bind($log, prefix),
          debug: $log.debug.bind($log, prefix)
        };
        return logger;
      };
    }

    return new LogFactory();
  }
]);