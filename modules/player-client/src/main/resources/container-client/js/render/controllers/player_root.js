var controller = function ($scope, $compile, $http, $timeout, PlayerServices, CorespringContainer) {
  $scope.submit = function () {
    return PlayerServices.submitAnswers({
      answers: CorespringContainer.getAnswers()
    }, $scope.onSessionSaved, $scope.onSessionSaveError);
  };
  $scope.onSessionSaved = function (data) {
    if (data.responses != null) {
      CorespringContainer.updateResponses(data.responses);
    }
    if (data.session != null) {
      CorespringContainer.updateSession(data.session);
    }
    if (data.session != null) {
      return $scope.session = data.session;
    }
  };
  $scope.updateSession = function (data) {
    if (!$scope.model || !$scope.model.session) {
      return;
    }
    $scope.model.session.remainingAttempts = data.session.remainingAttempts;
    $scope.model.session.isFinished = data.session.isFinished;
    return $scope.$broadcast('session-finished', $scope.model.session.isFinished);
  };
  $scope.onSessionLoadError = function (error) {
    return console.warn("Error loading session");
  };
  $scope.onSessionSaveError = function (error) {
    return console.warn("Error saving session");
  };
  $scope.onSessionLoaded = function (data) {
    $scope.model = data;
    CorespringContainer.initialize(data);
    if (data.responses != null) {
      CorespringContainer.updateResponses(data.responses);
    }
    if (data.session != null) {
      CorespringContainer.updateSession(data.session);
    }
    if (data.session != null) {
      return $scope.session = data.session;
    }
  };
  return PlayerServices.loadSession($scope.onSessionLoaded, $scope.onSessionLoadError);
};


angular.module('corespring-player.controllers').controller('Root', ['$scope', '$compile', '$http', '$timeout', 'PlayerServices', 'CorespringContainer', controller]);