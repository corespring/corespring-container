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
  };

  $scope.onSessionSaveError = function (error) {
    console.warn("Error saving session");
  };

  $scope.canSubmit = function() {
    return $scope.session.settings.allowEmptyResponses || !ComponentRegister.hasEmptyAnswers();
  };


  $scope.resetPreview = function(){

    ComponentRegister.reset();

    /*for(var x in $scope.responses ){
        $scope.responses[x] = {};
    }
    $scope.session.remainingAttempts = $scope.session.settings.maxNoOfAttempts;
    PlayerServices.updateSessionSettings($scope.session.settings);
    $scope.score = null;
    if($scope.rootModel){
      $scope.rootModel.session = {};
    }*/

    /*for(var key in $scope.rootModel.session.components){

      var s = $scope.rootModel.session.components[key];
      if(s){
        s.answers = null;
      }
    }*/

    $scope.session.isFinished = false;
//    ComponentRegister.setGlobalSession($scope.session);
  };

  $scope.$watch('session.settings', function(newSettings){
    $scope.resetPreview();
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
