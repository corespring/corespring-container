var controller = function ($scope, $rootScope, $log) {

  var mode = null;

  var evaluateOptions = {
    showFeedback: true,
    allowEmptyResponses: true,
    highlightCorrectResponse: true,
    highlightUserResponse: true,
    "corespring-drag-and-drop" : {
      "blah" : "blah"
    }
  };


  $scope.submit = function(){
    $scope.$emit('saveResponses', { isAttempt: true, isComplete: true } );
    //$scope.$emit('completeResponse');
    $scope.$emit('setMode', { mode: 'evaluate', options: evaluateOptions, saveResponses: null } );

  };

  $scope.reset = function(){
    $scope.$emit('reset');
  };

  $scope.$watch('session', function(newValue){
    if(newValue){
      $log.debug("Session loaded: " + newValue);
      if(newValue.isComplete && mode !== 'evaluate'){
        $scope.$emit('setMode', { mode: 'evaluate', options: evaluateOptions, saveResponses: null } );
        mode = 'evaluate';
      }
    }
  });

  $scope.$watch('outcome', function(newValue){
    if(newValue){
      $log.debug("outcome loaded");
    }
  });


  $scope.$watch('score', function(newValue){
    if(newValue){
      $log.debug("score loaded");
    }
  });

};


angular.module('corespring-player.controllers')
  .controller(
    'ContainerPlayerControls',
    ['$scope',
    '$rootScope',
    '$log',
     controller
    ]);