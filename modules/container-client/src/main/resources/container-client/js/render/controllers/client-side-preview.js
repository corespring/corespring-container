var controller = function($scope, ComponentRegister, PlayerService) {

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

  $scope.submit = function() {
    var components = ComponentRegister.getComponentSessions();
    PlayerService.submitSession({
      components: components
    }, $scope.onSessionSaved, $scope.onSessionSaveError);
  };

  $scope.onSessionSaved = function(data) {
    $scope.responses = data.responses;
    $scope.session = data.session;
    $scope.outcome = data.outcome;
    $scope.score = data.score;
  };

  $scope.onSessionSaveError = function(error) {};

  $scope.canSubmit = function() {
    return !ComponentRegister.hasEmptyAnswers();
  };

  $scope.resetPreview = function() {
    ComponentRegister.reset();
    $scope.session.isComplete = false;
    $scope.score = undefined;
  };
};

angular.module('corespring-player.controllers')
  .controller(
    'ClientSidePreview', [
      '$scope',
      'ComponentRegister',
      'PlayerService',
      controller
    ]
);