angular.module("simulator", []);


angular.module("simulator").controller('Root', ['$scope', '$log', function($scope, $log){

  $log.debug("Root controller");

  $scope.mode = "gather";

  $scope.idLabel = function(){
    return $scope.mode === "gather" ? "Item Id" : "Session Id";   
  };

  $scope.add = function() { 
    var options = {
      mode: $scope.mode
    };
    var idName = $scope.mode === "gather" ? "itemId" : "sessionId";

    options[idName] = $scope.id;

    $scope.player = new org.corespring.players.ItemPlayer('#player-holder', options);
  };

  $scope.remove = function() {

  };

}]);