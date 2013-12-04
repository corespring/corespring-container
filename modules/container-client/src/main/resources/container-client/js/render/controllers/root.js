var controller = function ($scope, $log, $timeout, MessageBridge) {

  $scope.messageBridgeListener = function(event){
    var data = typeof(event.data) == "string" ? JSON.parse(event.data) : event.data;

    console.log("[MessageBridge] event received: " + event.data + " : " + typeof(event.data) );
    var broadcastToChildren = function(){
      $scope.$broadcast(data.message, data, function(result){
        var response = _.extend(result, {message: data.message + 'Result'});
        MessageBridge.sendMessage('parent', response, false);
      });
    };

    $timeout(broadcastToChildren, 200);
  };

  MessageBridge.addMessageListener($scope.messageBridgeListener);
  MessageBridge.sendMessage('parent', {message: 'ready'}, false);

  $timeout( function(){
    $scope.$broadcast('begin');
  });

  $scope.$on("session-loaded", function(event, session){
    MessageBridge.sendMessage('parent', { message: "sessionCreated", session: session}, false);
  });


  $scope.$on("inputReceived", function(event, data){
    MessageBridge.sendMessage('parent', { message: "inputReceived", sessionStatus: data.sessionStatus}, false);
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