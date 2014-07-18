var controller = function($scope, $log) {

  var mode = null;

  function setMode(newMode) {
    if (mode !== newMode) {
      $scope.$emit('setMode', {
        mode: newMode,
        options: $scope.evaluateOptions,
        saveResponses: null
      });
      mode = newMode;
    }
  }

  $scope.submit = function() {

    //TODO Isn't it weird to change the mode from the control panel? Should be in main, or?
    var onSaveSuccess = function(err) {
      setMode('evaluate');
    };

    $scope.$emit('saveResponses', {
      isAttempt: true,
      isComplete: true,
      onSaveSuccess: onSaveSuccess
    });

  };

  $scope.reset = function() {
    //TODO Looks more like business logic which doesn't belong in here
    if ($scope.session && !$scope.session.isComplete) {
      $scope.$emit('reset');
    }
  };

  $scope.$watch('session', function(newValue) {
    if (newValue) {
      $log.debug("Session loaded: ", newValue);
      if (newValue.isComplete) {
        setMode('evaluate');
      } else {
        setMode('gather');
      }
    }
  });

  $scope.$watch('outcome', function(newValue) {
    if (newValue) {
      $log.debug("outcome loaded");
    }
  });

  $scope.$watch('score', function(newValue) {
    if (newValue) {
      $log.debug("score loaded");
    }
  });

};


angular.module('corespring-player.controllers')
  .controller(
    'ContainerPlayerControls', ['$scope',
      '$log',
      controller
    ]);
