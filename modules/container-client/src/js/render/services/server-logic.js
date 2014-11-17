angular.module('corespring-player.services').factory('ServerLogic', ['$log', function($log) {

  var ServerLogic = function() {

    this.load = function(name) {
      return corespring.server.logic(name);
    };

  };

  return new ServerLogic();

}]);
