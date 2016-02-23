angular.module('corespring-player.services').factory('PlayerServiceDefinition', [
  '$http',
  '$log',
  'PlayerServiceEndpoints',
  'EmbeddedItemAndSession',
  function($http, $log, PlayerServiceEndpoints, EmbeddedItemAndSession) {

    function PlayerServiceDefinition() {
      $log.log('PlayerServiceDefinition', PlayerServiceEndpoints);

      var isItemAndSessionLoaded = false;

      this.setQueryParams = function(p) {
        throw new Error('no longer supported');
      };

      this.loadItemAndSession = function loadItemAndSession(onSuccess, onFailure){
        onSuccess(EmbeddedItemAndSession);
        isItemAndSessionLoaded = true;
      };

      this.completeResponse = callWithNoData(PlayerServiceEndpoints.urls.completeResponse);
      this.getScore = callWithData(PlayerServiceEndpoints.urls.getScore);
      this.loadInstructorData = callWithData(PlayerServiceEndpoints.urls.loadInstructorData);
      this.loadOutcome = callWithData(PlayerServiceEndpoints.urls.loadOutcome);
      this.reopenSession = callWithNoData(PlayerServiceEndpoints.urls.reopenSession);
      this.resetSession = callWithNoData(PlayerServiceEndpoints.urls.resetSession);
      this.saveSession = callWithData(PlayerServiceEndpoints.urls.saveSession);

      //-----------------------------------------------------------------

      function addQueryParamsIfPresent(path) {
        var out = [];
        var params = PlayerServiceEndpoints.queryParams;
        for (var x in params) {
          out.push(x + '=' + params[x]);
        }

        var qs = out.join('&');
        return path + (path.indexOf('?') == -1 ? '?' : '&') + qs;
      }

      function _call(call, data) {

        return function(onSuccess, onFailure) {
          if(!isItemAndSessionLoaded){
            if(onFailure){
              var e = '[PlayerService] Error: Not ready to make call to ' + call.method + '.';
              $log.error(e);
              onFailure(e);
            }
            return;
          }

          var url = addQueryParamsIfPresent(call.url);
          var args = data ? [url, data] : [url];

          $http[call.method].apply(null, args)
            .success(
            function(data, status, headers, config) {
              onSuccess(data);
            })
            .error(
            function(data, status, headers, config) {
              console.log("error");
              if (onFailure) {
                onFailure(data);
              }
            }
          );
        };
      }

      function callWithData(call) {
        return function(data, onSuccess, onFailure, id) {
          _call(call, data)(onSuccess, onFailure);
        };
      }

      function callWithNoData(call) {
        return function(onSuccess, onFailure, id) {
          _call(call, null)(onSuccess, onFailure);
        };
      }
    }

    return PlayerServiceDefinition;
  }
]);

