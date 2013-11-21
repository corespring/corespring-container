var controller = function ($scope, $log, $timeout, MessageBridge) {

  $scope.messageBridgeListener = function(event){
    $log.debug("[player:Root] message received: ", event);
  };

  MessageBridge.addMessageListener($scope.messageBridgeListener);
  MessageBridge.sendMessage('parent', 'ready', true);

  $timeout( function(){
    $scope.$broadcast('begin');
  });
};

angular.module('corespring-player.controllers')
  .controller(
    'Root',
    ['$scope',
    '$log',
    '$timeout',
    'MessageBridge',
     controller
    ]);