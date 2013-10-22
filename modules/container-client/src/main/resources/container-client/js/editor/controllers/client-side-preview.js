var controller = function ($scope, ComponentRegister, PlayerServices) {

  var getUid = function(){
    return Math.random().toString(36).substring(2,9);
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
    var cleaned = {};
    for(var x in $scope.responses ){
        cleaned[x] = {};
    }
    $scope.session.isFinished = false;
    $scope.responses = cleaned;
    PlayerServices.updateSessionSettings(newSettings);
  }, true);

  $scope.getQuestionForComponentId = function(id){
    return $scope.components[id];
  };

  $scope.session = {
    settings: {
      maxNoOfAttempts: 1,
      showFeedback: true
    },
    remainingAttempts : 2,
    isFinished:false,
    answers: {
      blah: ["3"]
    }
  };

  $scope.responses = {
    blah:  {
      "correctness": "correct",
      "feedback": [
        {
          "correct": true,
          "feedback": "Great Job",
          "value": "3"
        }
      ],
      "score": 1
    }
  };

  PlayerServices.setQuestionLookup($scope.getQuestionForComponentId);

};

angular.module('corespring-editor.controllers')
  .controller(
    'ClientSidePreview',
    ['$scope', 'ComponentRegister', 'PlayerServices', controller]
  );
