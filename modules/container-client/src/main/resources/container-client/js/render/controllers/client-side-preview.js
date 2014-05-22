var controller = function($scope, ComponentRegister, PlayerService) {

  var defaultSession = {
    remainingAttempts: 1,
    settings: {
      maxNoOfAttempts: 1,
      highlightUserResponse: true,
      highlightCorrectResponse: true,
      showFeedback: true
    }
  };

  $scope.responses = {};
  $scope.session = _.cloneDeep(defaultSession);

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
    ComponentRegister.setEditable(false);
  };

  $scope.resetStash = function() {
    ComponentRegister.resetStash();
  };

  $scope.onSessionSaveError = function(error) {};

  $scope.canSubmit = function() {
    return !ComponentRegister.hasEmptyAnswers();
  };

  $scope.resetPreview = function() {
    ComponentRegister.reset();
    $scope.session.isComplete = false;
    $scope.score = undefined;
    ComponentRegister.setEditable(true);
  };

  $scope.setMode = function(mode) {
    ComponentRegister.setMode(mode);
  };

  $scope.setDataAndSession = function(data) {
    ComponentRegister.setDataAndSession(data);
  };

  $scope.$on('resetPreview', $scope.resetPreview);
  $scope.$on('resetStash', $scope.resetStash);

  $scope.$on('setMode', function(event, message) {
    if (message.mode) {
      $scope.setMode(message.mode);
    }
    if (message.options) {
      PlayerService.updateSessionSettings(message.options);
    }
  });

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