angular.module("simulator", []);


angular.module("simulator").controller('Root', ['$scope', '$log', function($scope, $log){

  $log.debug("Root controller");

  $scope.mode = "gather";

  $scope.itemId = "522267c2554f43f858000001";

  $scope.idLabel = function(){
    return $scope.mode === "gather" ? "Item Id" : "Session Id";   
  };

  $scope.onSessionCreated = function(sessionId){

    $log.debug("session created: ", sessionId);

    $scope.$apply(function(){
      $scope.sessionId = sessionId;
    });
  };

  $scope.add = function() { 
    var options = {
      mode: $scope.mode,
      onSessionCreated : $scope.onSessionCreated
    };

    var idName = $scope.mode === "gather" ? "itemId" : "sessionId";

    options[idName] = $scope[idName];

    $scope.player = new org.corespring.players.ItemPlayer('#player-holder', options);
  };

  $scope.remove = function() {
    delete $scope.player;
    $("#player-holder").html('');
  };

  $scope.save = function(){
    $scope.player.saveResponses(false);
  };

  $scope.submit = function(){
    $scope.player.saveResponses(true);
    //only needed for secure mode
    //$scope.player.completeResponse();
    $scope.player.setMode("view");
  };

}]);