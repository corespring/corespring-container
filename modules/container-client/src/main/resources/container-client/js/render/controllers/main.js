var controller = function ($scope, $log, ComponentRegister, PlayerServices) {

  $scope.onAnswerChanged = function(){
    $scope.$emit("inputReceived", {sessionStatus: getSessionStatus()});
  };

  ComponentRegister.setAnswerChangedHandler($scope.onAnswerChanged);

  $scope.canSubmit = function() {
    if (!$scope.session || !$scope.session.settings) return false;
    return $scope.session.settings.allowEmptyResponses || !ComponentRegister.hasEmptyAnswers();
  };

  $scope.save = function (isAttempt, cb) {
    PlayerServices.saveSession(
      {
        isAttempt: isAttempt, 
        components: ComponentRegister.getComponentSessions()
      }, 
      function(s){ 
        $scope.onSessionSaved(s); 
        if(cb){
          cb(s);
        }
      },
      function(e){
        $scope.onSessionSaveError(e);
        if(cb){
          cb();
        }
      } 
      );
  };

  $scope.loadOutcome = function (options, cb){
    //TODO - need to fetch the player options
    //Passed in to the launcher
    PlayerServices.loadOutcome(options,
      function(data){
        $scope.onOutcomeLoaded(data);
        if(cb) {
          cb(data); 
        }
      }
    );
  };

  $scope.onOutcomeLoaded = function(data){
    $scope.outcome = data.outcome;
    $scope.score = data.score;
  };
  
  $scope.loadOutcomeError = function(err){
    $log.error(err); 
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
    $scope.session = session;
  };

  $scope.updateSession = function (data) {
    if (!$scope.model || !$scope.model.session) {
      return;
    }
    $scope.session.remainingAttempts = data.session.remainingAttempts;
    $scope.session.isFinished = data.session.isFinished;
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
    $scope.item = data.item;
    $scope.session = data.session;
    $scope.outcome = data.outcome;
    $scope.score = data.score;
    $scope.$emit("session-loaded", data.session);
  };

  $scope.resetPreview = function(){
    ComponentRegister.reset();
  };

  var getSessionStatus = function(){
    return {
      allInteractionsHaveResponse: !ComponentRegister.hasEmptyAnswers(),
      interactionCount: ComponentRegister.interactionCount(),
      interactionsWithResponseCount: ComponentRegister.interactionsWithResponseCount()
    };
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
    callback({ sessionStatus : getSessionStatus()});
  });

  $scope.$on('editable', function(event, data){
    ComponentRegister.setEditable(data.editable);
  });

  $scope.$on('setMode', function(event, data){
    var editable = (data.mode == 'gather');
    ComponentRegister.setEditable(editable);
    ComponentRegister.setMode(data.mode);

    if(data.mode == 'evaluate'){
      $scope.save(false, function(){
        $scope.loadOutcome(data.options, function(){
          $log.debug("score received");
        });
      });
    } else {
      _.forIn($scope.outcome, function(value, key){
        $scope.outcome[key] = {};
      });
      $scope.score = {};
    }
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