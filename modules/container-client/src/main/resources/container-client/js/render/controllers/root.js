var controller = function ($scope, ComponentRegister, PlayerServices) {

  $scope.submit = function () {
    PlayerServices.submitSession({
      components: ComponentRegister.getComponentSessions()
    }, $scope.onSessionSaved, $scope.onSessionSaveError);
  };

  $scope.onSessionSaved = function (data) {
    $scope.session = data.session;
    $scope.outcome = data.outcome;
    $scope.responses = data.responses;
  };

  $scope.updateSession = function (data) {
    if (!$scope.model || !$scope.model.session) {
      return;
    }
    $scope.model.session.remainingAttempts = data.session.remainingAttempts;
    $scope.model.session.isFinished = data.session.isFinished;
    $scope.$broadcast('session-finished', $scope.model.session.isFinished);
  };

  $scope.onSessionLoadError = function (error) {
    console.warn("Error loading session");
  };

  $scope.onSessionSaveError = function (error) {
    console.warn("Error saving session");
  };

  $scope.onSessionLoaded = function (data) {
    $scope.model = data.item;
    $scope.session = data.session;
    $scope.outcome = data.outcome;
    $scope.responses = data.responses;
  };

  PlayerServices.loadSession($scope.onSessionLoaded, $scope.onSessionLoadError);
};


angular.module('corespring-player.controllers')
  .controller(
    'Root',
    [
    '$scope',
    'ComponentRegister',
    'PlayerServices',
     controller
    ]);