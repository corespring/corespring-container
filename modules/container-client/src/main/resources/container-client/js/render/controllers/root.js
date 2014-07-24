var controller = function ($scope, $log, $timeout, MessageBridge) {

  $scope.messageBridgeListener = function(event){
    var data = typeof(event.data) === "string" ? JSON.parse(event.data) : event.data;

    $log.info("[Root.messageBridgeListener] event received: " + event.data + " : " + typeof(event.data) );
    var broadcastToChildren = function(){
      $log.info("[Root.broadcastToChildren] " + data.message );
      $scope.$broadcast(data.message, data, function(result){
        var response = _.extend(result, {message: data.message + 'Result'});
        MessageBridge.sendMessage('parent', response);
      });
    };

    $timeout(broadcastToChildren, 100);
  };

  MessageBridge.addMessageListener($scope.messageBridgeListener);
  MessageBridge.sendMessage('parent', {message: 'ready'});

  $scope.$on("session-loaded", function(event, session){
    MessageBridge.sendMessage('parent', { message: "sessionCreated", session: session});
  });

  $scope.$on("inputReceived", function(event, data){
    MessageBridge.sendMessage('parent', { message: "inputReceived", sessionStatus: data.sessionStatus});
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