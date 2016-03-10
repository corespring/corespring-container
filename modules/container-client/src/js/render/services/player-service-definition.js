angular.module('corespring-player.services').factory('PlayerServiceDefinition', [
  '$http',
  '$log',
  'PlayerServiceEndpoints',
  'EmbeddedItemAndSession',
  function(
    $http,
    $log,
    PlayerServiceEndpoints,
    EmbeddedItemAndSession
  ) {

    function PlayerServiceDefinition() {
      $log.log('PlayerServiceDefinition', PlayerServiceEndpoints);

      this.setQueryParams = function(p) {
        throw new Error('no longer supported');
      };

      var isItemAndSessionLoaded = false;

      this.loadItemAndSession = function loadItemAndSession(onSuccess, onFailure) {
        onSuccess(EmbeddedItemAndSession);
        isItemAndSessionLoaded = true;
      };

      this.initCalls = function(endpoints){
        this.completeResponse = callWithNoData(endpoints.complete, 'completeResponse');
        this.getScore = callWithData(endpoints.getScore, 'getScore');
        this.loadInstructorData = callWithData(endpoints.loadInstructorData, 'loadInstructorData');
        this.loadOutcome = callWithData(endpoints.loadOutcome, 'loadOutcome');
        this.reopenSession = callWithNoData(endpoints.reopen, 'reopenSession');
        this.resetSession = callWithNoData(endpoints.reset, 'resetSession');
        this.saveSession = callWithData(endpoints.save, 'saveSession');
      };

      this.initCalls(PlayerServiceEndpoints.session);

      //-----------------------------------------------------------------

      function callWithData(call, id) {
        return function(data, onSuccess, onFailure) {
          _call(call, data, id)(onSuccess, onFailure);
        };
      }

      function callWithNoData(call, id) {
        return function(onSuccess, onFailure) {
          _call(call, null, id)(onSuccess, onFailure);
        };
      }

      function _call(call, data, id) {

        return function(onSuccess, onFailure) {
          if (!isItemAndSessionLoaded) {
            if (onFailure) {
              var e = '[PlayerService] Error: Not ready to make call to ' + id + '.';
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

      function addQueryParamsIfPresent(path) {
        var out = [];
        var params = PlayerServiceEndpoints.queryParams;
        for (var x in params) {
          out.push(x + '=' + params[x]);
        }

        var qs = out.join('&');
        return path + (path.indexOf('?') === -1 ? '?' : '&') + qs;
      }

    }

    return PlayerServiceDefinition;
  }
]);