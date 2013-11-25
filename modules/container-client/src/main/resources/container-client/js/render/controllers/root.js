var controller = function ($scope, $log, $timeout, MessageBridge) {

  $scope.messageBridgeListener = function(event){
    $log.debug("[player:Root] message received: ", event);
    var data = typeof(event.data) == "string" ? JSON.parse(event.data) : event.data;
    $scope.$broadcast(data.message, data, function(result){
      var response = _.extend(result, {message: data.message + 'Result'});
      MessageBridge.sendMessage('parent', response, true);
    });
  };

  MessageBridge.addMessageListener($scope.messageBridgeListener);
  MessageBridge.sendMessage('parent', {message: 'ready'}, true);

  $timeout( function(){
    $scope.$broadcast('begin');
  });

  $scope.$on("session-loaded", function(event, session){
    MessageBridge.sendMessage('parent', { message: "sessionCreated", session: session}, true);
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