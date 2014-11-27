angular.module('corespring-player.services').factory('PlayerUtils', ['$log', function($log){ 

  var PlayerUtils = function(){

    this.zipDataAndSession = function(components, session){
      var keys = _.keys(components);

      var zipped = _.map(keys, function(k){
        var s = (session && session.components) ? session.components[k] : null;
        return { data: components[k], session: s};
      });

      return _.zipObject(keys, zipped); 
    };
  };

  return new PlayerUtils();

}]);
