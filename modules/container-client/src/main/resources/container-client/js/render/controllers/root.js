var controller = function($scope, $log, $timeout, MessageBridge) {

  $scope.messageBridgeListener = function(event) {
    var data = typeof(event.data) === "string" ? JSON.parse(event.data) : event.data;

    $log.info("[Root.messageBridgeListener] event received: " + event.data + " : " + typeof(event.data));
    var broadcastToChildren = function() {
      $log.info("[Root.broadcastToChildren] " + data.message);
      $scope.$broadcast(data.message, data, function(result) {
        var response = _.extend(result, {
          message: data.message + 'Result'
        });
        MessageBridge.sendMessage('parent', response);
      });
    };

    $timeout(broadcastToChildren, 100);
  };

  MessageBridge.addMessageListener($scope.messageBridgeListener);

  var getQueryParams = function(  ) {

    var queryString = (window && window.location &&
      window.location.search && _.isString(window.location.search) &&
      window.location.search.length > 1) ? window.location.search.substring(1): null;

    if (!queryString){
      return null;
    }
    var params = {}, queries, temp, i, l;

    queries = queryString.split("&");

    for ( i = 0, l = queries.length; i < l; i++ ) {
      temp = queries[i].split('=');
      params[temp[0]] = temp[1];
    }

    return params;
  };

  (function() {
    //jshint eqeqeq:false
    if (parent == window) {
      $timeout(function() {
        var data ={
          mode: 'gather'
        };
        var qparams = getQueryParams();
        if (qparams){
          data.queryParams = qparams;
        }
        $scope.$broadcast('initialise', data);
      });
    } else {
      MessageBridge.sendMessage('parent', {
        message: 'ready'
      });
    }
  })();

  $scope.$on("session-loaded", function(event, session) {
    MessageBridge.sendMessage('parent', {
      message: "sessionCreated",
      session: session
    });
  });

  $scope.$on("inputReceived", function(event, data) {
    MessageBridge.sendMessage('parent', {
      message: "inputReceived",
      sessionStatus: data.sessionStatus
    });
  });

};

angular.module('corespring-player.controllers')
  .controller(
    'Root', ['$scope',
      '$log',
      '$timeout',
      'MessageBridge',
      controller
    ]);
