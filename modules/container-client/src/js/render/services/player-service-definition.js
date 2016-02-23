angular.module('corespring-player.services').factory('PlayerServiceDefinition', [
  '$log',
  function($log) {

    function PlayerServiceDefinition(urls, queryString) {
      $log.log('PlayerServiceDefinition', urls, queryString);

      this.setQueryParams = function(p) {
        throw new Error('no longer supported');
      };

      this.saveSession = callWithData(urls.saveSession);
      this.reopenSession = callWithNoData(urls.reopenSession);
      this.resetSession = callWithNoData(urls.resetSession);
      this.getScore = callWithData(urls.getScore);
      this.completeResponse = callWithNoData(urls.completeResponse);
      this.loadItemAndSession = callWithNoData(urls.loadSession, true);
      this.loadOutcome = callWithData(urls.loadOutcome);
      this.loadInstructorData = callWithData(urls.loadInstructorData);

      //-----------------------------------------------------------------

      function addQueryParamsIfPresent(path) {
        var out = [];
        for (var x in params) {
          out.push(x + '=' + params[x]);
        }

        var qs = out.join('&');
        return path + (path.indexOf('?') == -1 ? '?' : '&') + qs;
      }

      function _call(call, data, isCallToLoadItemAndSession) {

        return function(onSuccess, onFailure) {

          if(isCallToLoadItemAndSession){
            isItemAndSessionLoaded = false;
          } else if(!isItemAndSessionLoaded){
            if(onFailure){
              var e = '[PlayerService] Error: Not ready to make call to ' + call.method + '.'
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
              if(isCallToLoadItemAndSession){
                isItemAndSessionLoaded = true;
              }
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
      };

      function callWithData(call, isCallToLoadItemAndSession) {
        return function(data, onSuccess, onFailure, id) {
          _call(call, data, isCallToLoadItemAndSession)(onSuccess, onFailure);
        };
      }

      function callWithNoData(call, isCallToLoadItemAndSession) {
        return function(onSuccess, onFailure, id) {
          _call(call, null, isCallToLoadItemAndSession)(onSuccess, onFailure);
        };
      }
    }

    return PlayerServiceDefinition;
  }
]);

