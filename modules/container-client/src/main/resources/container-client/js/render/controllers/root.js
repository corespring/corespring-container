var controller = function($scope, $log, $timeout, MessageBridge) {

  /* global msgr */
  var dispatcher = new msgr.Dispatcher(window, window.parent);
  var receiver = new msgr.Receiver(window, window.parent);

  receiver.on('?', function(data, done){
    $log.info("[Root.broadcastToChildren] " + data.message);
    $scope.$broadcast('?', data, function(result) {
      done(null, result);
    });
  });

  $scope.$on("session-loaded", function(event, session) {
    dispatcher.send( "sessionCreated", {session: session});
  });

  $scope.$on("inputReceived", function(event, data) {
    dispatcher.send("inputReceived", data.sessionStatus);
  });

  $scope.$on("rendered", function(event) {
    dispatcher.send("rendered");
  });

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
    }
  })();

};

angular.module('corespring-player.controllers')
  .controller(
    'Root', ['$scope',
      '$log',
      '$timeout',
      'MessageBridge',
      controller
    ]);
