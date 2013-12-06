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
    var components = ComponentRegister.getComponentSessions();
    console.log("Submitting: ", components);
    PlayerServices.submitSession({components: components}, $scope.onSessionSaved, $scope.onSessionSaveError);
  };

  $scope.onSessionSaved = function (data) {
    $scope.responses = data.responses;
    $scope.session = data.session;
    $scope.outcome = data.outcome;
    $scope.score = data.score;
  };

  $scope.onSessionSaveError = function (error) {
    console.warn("Error saving session");
  };

  $scope.canSubmit = function() {
    return !ComponentRegister.hasEmptyAnswers();
  };

  $scope.resetPreview = function(){
    ComponentRegister.reset();
    $scope.session.isComplete = false;
  };
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
