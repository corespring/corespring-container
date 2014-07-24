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

  $scope.$on('saveResponses', function saveResponses( event, data) {
    var components = ComponentRegister.getComponentSessions();
    PlayerService.submitSession({
      components: components
    },
    function(everything){
      $scope.onSessionSaved(everything);
      if(_.isFunction(data.onSaveSuccess)){
        data.onSaveSuccess(everything);
      }
    }, $scope.onSessionSaveError);
  });

  $scope.preview = function() {
    $scope.$emit('launch-catalog-preview');
  };

  $scope.onSessionSaved = function(everything) {
    ComponentRegister.setEditable(false);
    $scope.responses = everything.responses;
    $scope.session = everything.session;
    $scope.outcome = everything.outcome;
    $scope.score = everything.score;
  };

  $scope.resetStash = function() {
    ComponentRegister.resetStash();
  };

  $scope.onSessionSaveError = function(error) {};

  $scope.canSubmit = function() {
    return !ComponentRegister.hasEmptyAnswers();
  };

  $scope.resetPreview = function() {
    $scope.session.isComplete = false;
    $scope.score = undefined;
    $scope.outcome = undefined;
    ComponentRegister.reset();
  };

  $scope.setMode = function(mode) {
    ComponentRegister.setMode(mode);
  };

  $scope.setDataAndSession = function(data) {
    ComponentRegister.setDataAndSession(data);
  };

  $scope.$on('resetPreview', $scope.resetPreview);
  $scope.$on('resetStash', $scope.resetStash);

  $scope.$on('setEvaluateOptions', function(event, evaluateOptions){
    if (evaluateOptions) {
      PlayerService.updateSessionSettings(evaluateOptions);

    }
  });

  $scope.$on('setMode', function(event, message) {
    if (message.mode) {
      $scope.setMode(message.mode);
    }
    if (message.options) {
      PlayerService.updateSessionSettings(message.options);
    }
    ComponentRegister.setEditable(message.mode === 'gather');
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