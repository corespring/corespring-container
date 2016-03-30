angular.module('corespring-common.services')
.service('MetadataService',
  [
  '$http',
  '$q',
  'LogFactory',
  'QueryParamUtils',
  'STATIC_PATHS',
  function MetadataService (
    $http, 
    $q, 
    LogFactory, 
    QueryParamUtils, 
    STATIC_PATHS) {

    var $log = LogFactory.getLogger('MetadataService');

    this.get = get;
    this.getPromise = null;

    function get(id){
      if(!this.getPromise){
        var defer = $q.defer();
        this.getPromise = defer.promise;
        var url = QueryParamUtils.addQueryParams(STATIC_PATHS.metadata.replace(/:id/, id));
        _call(url, defer.resolve, defer.reject);
      }
      return this.getPromise;
    }

    function _call(url, onSuccess, onFailure){
      $http({method: 'GET', url: url})
      .success(
        function success(data, status, headers, config){
          $log.debug("success", data);
          onSuccess(data);

        })
      .error(
        function failure(e){
          $log.warn("err: ", e);
          if(onFailure){
            onFailure(e);
          }
        });
    }
  }]);