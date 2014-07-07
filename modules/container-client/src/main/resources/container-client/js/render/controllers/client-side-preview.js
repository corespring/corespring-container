var controller = function($scope, ComponentRegister, PlayerServiceDef) {

  $scope.getQuestionForComponentId = function(id) {
    return $scope.data.item.components[id];
  };

  $scope.getItem = function() {
    return $scope.data.item;
  };

  $scope.getScoringJs = function() {
    var scoringJs = _.find($scope.data.item.files, function(f) {
      return f.name === "scoring.js";
    });
    return scoringJs;
  };

  var PlayerService = new PlayerServiceDef(
    $scope.getQuestionForComponentId,
    $scope.getItem,
    $scope.getScoringJs);

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

  $scope.preview = function() {
    $scope.$emit('launch-catalog-preview');
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
    $scope.outcome = undefined;
    ComponentRegister.setEditable(true);
  };

  $scope.setMode = function(mode) {
    ComponentRegister.setMode(mode);
  };

  $scope.setDataAndSession = function(data) {
    ComponentRegister.setDataAndSession(data);
  };

  $scope.$watch('data', function(d) {
    console.log('...........d ', d);
  });

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