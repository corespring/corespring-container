angular.module('corespring-player.controllers')
  .controller(
    'Root', ['$scope',
      '$log',
      '$timeout',
      'Msgr',
      'iFrameService',
       function($scope, $log, $timeout, Msgr, iFrameService) {

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

        if (iFrameService.isInIFrame()) {
          Msgr.on('*', function(eventName, data, done){
            $log.info("[Root.broadcastToChildren] " + eventName);
            $scope.$broadcast(eventName, data, done);
          });

          $scope.$on("session-loaded", function(event, session) {
            Msgr.send("sessionCreated", {session: session});
          });

          $scope.$on("inputReceived", function(event, data) {
            Msgr.send("inputReceived", data.sessionStatus);
          });

          $scope.$on("rendered", function(event) {
            Msgr.send("rendered");
          });

          Msgr.send('ready');
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
