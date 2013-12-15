angular.module("simulator", ['ui.bootstrap']).config(function ($locationProvider) {
  $locationProvider.html5Mode(true);
});

angular.module("simulator").controller('Test', ['$scope', '$log', '$http', '$location', '$modal', function ($scope, $log, $http, $location, $modal) {

  $scope.mode = "evaluate";

  $scope.itemId = "522267c2554f43f858000003";
  $scope.sessionId = "52a84393300467192d86a8ae";

  var server = "localhost:9000";

  $scope.modeSettings = {
    showFeedback: true,
    allowEmptyResponses: true,
    highlightCorrectResponse: true,
    highlightUserResponse: true,
    "corespring-drag-and-drop" : {
      "blah" : "blah"
      }
  };

  $scope.isSecure = false;

  $scope.settingsString = JSON.stringify($scope.modeSettings, null, "  ")

  $scope.idLabel = function(){
    return $scope.mode === "gather" ? "Item Id" : "Session Id";
  };

  $scope.$watch('mode', function (newMode, oldMode) {
    if ($scope.player) {
      $scope.player.setMode(newMode, function(err){
        if(err){
          $scope.mode = oldMode;
          if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
            $scope.$apply();
          }
        }
      });
    }
  });

  $scope.onSessionCreated = function (sessionId) {

    $log.debug("session created: ", sessionId);

    $scope.$apply(function () {
      $scope.sessionId = sessionId;
    });
  };

  $scope.onInputReceived = function (sessionStatus) {
    $log.debug("on input received: ", sessionStatus);
    $scope.$apply(function () {
      $scope.sessionStatus = sessionStatus;
    });
  };

  $scope.add = function () {
    var options = {
      mode: $scope.mode,
      onSessionCreated: $scope.onSessionCreated,
      onInputReceived: $scope.onInputReceived,
      evaluate: $scope.modeSettings,
      corespringUrl: "http://" + server
    };

    var idName = $scope.mode === "gather" ? "itemId" : "sessionId";

    options[idName] = $scope[idName];

    $scope.player = new org.corespring.players.ItemPlayer('#player-holder', options, $scope.handlePlayerError);
  };

  $scope.handlePlayerError = function(e){
    $log.debug("An error occured", e);

    $scope.$apply(function(){
      $scope.playerError = e;
    });
  };


  $scope.add();

}]);