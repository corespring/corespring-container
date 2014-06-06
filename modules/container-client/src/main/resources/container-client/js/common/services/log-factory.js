angular.module('corespring-common.services').service('LogFactory', [
  '$log',
  function($log) {

    function LogFactory() {

      /**
       * Return a logger that uses "[id] - " to start logging messages
       * @param id
       */
      this.getLogger = function(id){
        var logger = {id: id};
        var prefix = "[" + id + "] - ";
        var sourceObj = console ? console : $log;

        function bindIfPropertyExists(name){
          name = _.isFunction(sourceObj[name]) ? name : 'debug';
          logger[name] = sourceObj[name].bind(sourceObj, prefix);
        }

        bindIfPropertyExists('log');
        bindIfPropertyExists('info');
        bindIfPropertyExists('warn');
        bindIfPropertyExists('error');
        bindIfPropertyExists('fail');
        bindIfPropertyExists('debug');

        return logger;
      };
    }

    return new LogFactory();
  }
]);