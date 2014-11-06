angular.module('corespring-player.controllers')
  .controller(
    'Root', ['$scope',
      '$log',
      '$timeout',
      'MessageBridge',
       function($scope, $log, $timeout, MessageBridge) {

        function isInIframe(){
         return top !== window;
        }

        function getQueryParams() {

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
        }

        if(isInIframe()){
          /* global msgr */
          var channel = new msgr.Channel(window, window.parent);

          channel.on('*', function(eventName, data, done){
            $log.info("[Root.broadcastToChildren] " + data.message);
            $scope.$broadcast(eventName, data, function(result) {
              done(null, result);
            });
          });

          $scope.$on("session-loaded", function(event, session) {
            channel.send( "sessionCreated", {session: session});
          });

          $scope.$on("inputReceived", function(event, data) {
            channel.send("inputReceived", data.sessionStatus);
          });

          $scope.$on("rendered", function(event) {
            channel.send("rendered");
          });

          channel.send('ready');

        } else {
            $timeout(function() {
              var data = { mode: 'gather' };
              var qparams = getQueryParams();
              if (qparams){
                data.queryParams = qparams;
              }
              $scope.$broadcast('initialise', data);
            });
        }
      }
]);
