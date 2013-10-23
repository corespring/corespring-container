var controller = function ($scope, ComponentRegister, PlayerServices) {

  $scope.responses = {};
  $scope.session = {
    remainingAttempts: 1,
    settings: {
      maxNoOfAttempts: 1,
      highlightUserResponse: true,
      highlightCorrectResponse: true,
      showFeedback: true
    }
  };

  $scope.submit = function(){
    var answers = ComponentRegister.getAnswers();
    PlayerServices.submitAnswers({answers: answers}, $scope.onSessionSaved, $scope.onSessionSaveError);
  };

  $scope.onSessionSaved = function (data) {
    $scope.responses = data.responses;
    $scope.session = data.session;
    $scope.outcome = data.outcome;
  };

  $scope.onSessionSaveError = function (error) {
    console.warn("Error saving session");
  };

  $scope.$watch('session.settings', function(newSettings){
    for(var x in $scope.responses ){
        $scope.responses[x] = {};
    }
    $scope.session.isFinished = false;
    $scope.session.remainingAttempts = $scope.session.settings.maxNoOfAttempts;
    PlayerServices.updateSessionSettings(newSettings);
  }, true);
};

angular.module('corespring-editor.controllers')
  .controller(
    'ClientSidePreview',
    [
      '$scope',
      'ComponentRegister',
      'PlayerServices',
      controller
    ]
  );
