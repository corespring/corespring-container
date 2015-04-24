angular.module('corespring-common.services').service('LogFactory', [
  '$log',
  function($log) {

    function LogFactory() {

      /**
       * Return a logger that uses "[id] - " to start logging messages
       * and uses console if available so that the location of the log statement
       * is shown correctly in the logs, instead of some place in angular
       * @param id
       */
      this.getLogger = function(id){
        var logger = {id: id};
        var prefix = "[" + id + "] - ";
        var sourceObj = window.console ? console : $log;

        function bindIfPropertyExists(name){
          name = _.isFunction(sourceObj[name]) ? name : 'log';
          logger[name] = sourceObj[name].bind(sourceObj, prefix);
        }

        bindIfPropertyExists('debug');
        bindIfPropertyExists('error');
        bindIfPropertyExists('fail');
        bindIfPropertyExists('info');
        bindIfPropertyExists('log');
        bindIfPropertyExists('trace');
        bindIfPropertyExists('warn');

        return logger;
      };
    }

    return new LogFactory();
  }
]);