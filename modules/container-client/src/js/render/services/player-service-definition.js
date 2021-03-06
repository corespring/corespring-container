angular.module('corespring-player.services')
  .factory('PlayerServiceDefinition', [
  '$http',
  '$log',
  'PlayerServiceEndpoints',
  'EmbeddedItemAndSession',
  'QueryParamUtils',
  function(
    $http,
    $log,
    PlayerServiceEndpoints,
    EmbeddedItemAndSession,
    QueryParamUtils
  ) {

    function PlayerServiceDefinition() {
      $log.log('PlayerServiceDefinition', PlayerServiceEndpoints);

      this.setQueryParams = function(p) {
        throw new Error('no longer supported');
      };

      var isItemAndSessionLoaded = false;

      var callQueue = [];

      function invokeQueuedCall(opts){
        _callHttp(opts.call, opts.data, opts.onSuccess, opts.onFailure);
      }

      this.loadItemAndSession = function loadItemAndSession(onSuccess, onFailure) {
        isItemAndSessionLoaded = true;
        onSuccess(EmbeddedItemAndSession);
        _.forEach(callQueue, invokeQueuedCall);
        callQueue = [];
      };

      this.initCalls = function(endpoints){
        this.completeResponse = callWithEmptyObjectAsData(endpoints.complete, 'completeResponse');
        this.getScore = callWithData(endpoints.getScore, 'getScore');
        this.loadInstructorData = callWithData(endpoints.loadInstructorData, 'loadInstructorData');
        this.loadOutcome = callWithData(endpoints.loadOutcome, 'loadOutcome');
        this.reopenSession = callWithNoData(endpoints.reopen, 'reopenSession');
        this.resetSession = callWithNoData(endpoints.reset, 'resetSession');
        this.saveSession = callWithData(endpoints.save, 'saveSession');
      };

      this.initCalls(PlayerServiceEndpoints.session);

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

      function callWithEmptyObjectAsData(call, id) {
        return function(onSuccess, onFailure) {
          _call(call, {}, id)(onSuccess, onFailure);
        };
      }


      function _callHttp(call, data, onSuccess, onFailure){
        var url = addQueryParamsIfPresent(call.url);
        var args = data ? [url, data] : [url];

        $http({method: call.method, url: url, data: data})
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
            });
      }

      function _call(call, data, id) {
        return function(onSuccess, onFailure) {
          if (!isItemAndSessionLoaded) {
            callQueue.push({call: call, data: data, id: id, onSuccess: onSuccess, onFailure: onFailure});
          } else {
            _callHttp(call, data, onSuccess, onFailure);
          }
        };
      }

      function addQueryParamsIfPresent(path) {
        return QueryParamUtils.addQueryParams(path);
      }

    }

    return PlayerServiceDefinition;
  }
]);