var controller = function ($scope, $log, ComponentRegister, PlayerServices) {

  $scope.canSubmit = function() {
    if (!$scope.session || !$scope.session.settings) return false;
    return $scope.session.settings.allowEmptyResponses || !ComponentRegister.hasEmptyAnswers();
  };

  $scope.submit = function () {
    PlayerServices.submitSession({
      components: ComponentRegister.getComponentSessions()
    }, $scope.onSessionSaved, $scope.onSessionSaveError);
  };

  $scope.save = function (isAttempt) {
    PlayerServices.saveSession(
      {
        isAttempt: isAttempt, 
        components: ComponentRegister.getComponentSessions()
      }, 
      $scope.onSessionSaved, 
      $scope.onSessionSaveError);
  };

  $scope.getScore = function(onSuccess, onError){
    PlayerServices.getScore(
        {
          components: ComponentRegister.getComponentSessions()
        },
        onSuccess, 
        onError
      );
  };

  $scope.completeResponse = function(){
    PlayerServices.completeResponse(
      function(){
        $scope.isComplete = true;
      },
      function(err){
        $scope.isComplete = false;
        $log.error(err);
      }
    );
  };

  $scope.onSessionSaved = function (session) {
    $scope.rootModel.session = session;
    $scope.session = session;
  };

  $scope.updateSession = function (data) {
    if (!$scope.model || !$scope.model.session) {
      return;
    }
    $scope.rootModel.session.remainingAttempts = data.session.remainingAttempts;
    $scope.rootModel.session.isFinished = data.session.isFinished;
    $scope.$broadcast('session-finished', $scope.model.session.isFinished);
  };

  $scope.onSessionLoadError = function (error) {
    $log.warn("Error loading session");
  };

  $scope.onSessionSaveError = function (error) {
    $log.warn("Error saving session");
  };

  $scope.onEverythingLoaded = function (data) {
    $scope.rootModel = data;
    $scope.session = data.session;
    $scope.outcome = data.outcome;
    $scope.responses = data.responses;
    $scope.$emit("session-loaded", data.session);
  };

  $scope.resetPreview = function(){
    ComponentRegister.reset();
  };

  $scope.$on('begin', function(){
    PlayerServices.loadSession($scope.onEverythingLoaded, $scope.onSessionLoadError);
  });

  $scope.$on('saveResponses', function(event, data){
    $scope.save(data.isAttempt);
  });

  $scope.$on('countAttempts', function(event, data, callback){
    callback({ count : $scope.session.attempts });
  });

  $scope.$on('getScore', function(event, data, callback){

    var onScoreReceived = function(outcome){
      callback({ score: outcome.summary.percentage} );
    };
    $scope.getScore(onScoreReceived);
  });

  $scope.$on('completeResponse', function(){
    $scope.completeResponse();
  });

  $scope.$on('isComplete', function(event, data, callback){
    callback({isComplete: $scope.isComplete || false});
  });

  $scope.$on('reset', function(){
    $scope.$apply(function(){
      $scope.resetPreview();
    });
  });

  $scope.$on('getSessionStatus', function(event, data, callback){

    var sessionStatus = {
      allInteractionsHaveResponse: !ComponentRegister.hasEmptyAnswers(),
      interactionCount: ComponentRegister.interactionCount(),
      interactionsWithResponseCount: ComponentRegister.interactionsWithResponseCount()
    };
    callback({ sessionStatus : sessionStatus});
  });

};


angular.module('corespring-player.controllers')
  .controller(
    'Main',
    ['$scope',
    '$log',
    'ComponentRegister',
    'PlayerServices',
     controller
    ]);