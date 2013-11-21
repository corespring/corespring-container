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

  $scope.onSessionSaved = function (data) {
    $scope.rootModel.session = data.session;
    $scope.outcome = data.outcome;
    $scope.responses = data.responses;
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

  $scope.onSessionLoaded = function (data) {
    $scope.rootModel = data;
    $scope.session = data.session;
    $scope.outcome = data.outcome;
    $scope.responses = data.responses;
  };

  $scope.$on('begin', function(){
    PlayerServices.loadSession($scope.onSessionLoaded, $scope.onSessionLoadError);
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