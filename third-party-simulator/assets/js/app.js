angular.module("simulator", ['ui.ace']).config(function ($locationProvider) {
  $locationProvider.html5Mode(true);
});

angular.module("simulator").controller('Root', ['$scope', '$log', '$http', '$location', function ($scope, $log, $http, $location) {

  $log.debug("Root controller");

  $scope.mode = "gather";

  $scope.itemId = $location.search()['sessionId'] ? "" : ($location.search()['itemId'] || "522267c2554f43f858000001");
  $scope.sessionId = $location.search()['sessionId'] || "";

  var server = ($location.search()['server'] || "localhost:9000");

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

  $scope.$watch('isSecure', function(newValue){
    var scriptTag = "<script src='http://"+server+"/player.js?secure="+newValue+"'></script>";
    $("head").append(scriptTag);
  });

  $scope.settingsString = JSON.stringify($scope.modeSettings, null, "  ")

  $scope.aceLoaded = function(_editor) {
    $scope.editor = _editor;
  };

  $scope.aceChanged = function(e) {
    try{
      var text = $scope.editor.getValue();
      $scope.modeSettings = JSON.parse(text);
    } catch (e){
    }
  };

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

  $scope.remove = function () {
    delete $scope.player;
    $("#player-holder").html('');
  };

  $scope.save = function (isAttempt) {
    $scope.player.saveResponses(isAttempt);
  };

  $scope.submit = function () {
    $scope.player.saveResponses(true);
    //only needed for secure mode
    //$scope.player.completeResponse();
    $scope.mode = "view";
    $scope.player.setMode($scope.mode);
  };

  $scope.updateAttemptCount = function () {
    $scope.player.countAttempts(function (result) {
      $log.debug("result: ", result);

      $scope.$apply(function () {
        $scope.attemptCount = result;
      });
    });
  };

  $scope.getScore = function () {
    $scope.player.getScore('percent', function (outcome) {
      $log.debug("get score: ", outcome);

      $scope.$apply(function () {
        $scope.score = outcome;
      });
    });
  };

  $scope.complete = function () {
    $scope.player.completeResponse();
  };

  $scope.updateIsComplete = function () {
    $scope.player.isComplete(function (isComplete) {
      $scope.$apply(function () {
        $scope.isComplete = isComplete;
      });

    });
  };

  $scope.reset = function () {
    $scope.player.reset();
  };

  $scope.updateSessionStatus = function () {
    $scope.player.getSessionStatus(function (status) {
      $scope.$apply(function () {
        $scope.sessionStatus = status;
      });
    });
  };

}]);