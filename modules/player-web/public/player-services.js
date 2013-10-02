angular.module('player-web.services', []);


angular.module('player-web.services').factory('PlayerServices', [ 'Config', function (Config) {

  return {
    saveSession: function (session, onSuccess, onFailure ) {
      //TODO
    },
    loadSession: function (onSuccess, onFailure) {
      //TODO
    }
  }

}]);