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

    var onSaveSuccess = function(err){
      $scope.$emit('setMode', { mode: 'evaluate', options: evaluateOptions, saveResponses: null } );
    };

    $scope.$emit('saveResponses', { isAttempt: true, isComplete: true, onSaveSuccess: onSaveSuccess } );

  };

  $scope.reset = function(){
    if($scope.session && !$scope.session.isComplete){
      $scope.$emit('reset');
    }
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