(function(){

  angular.module('corespring-common.services')
    .service('CollectionService',
    [
      '$http',
      '$q',
      'LogFactory',
      CollectionService
    ]
  );

  function CollectionService ($http, $q, LogFactory) {

    var $log = LogFactory.getLogger('CollectionService');
    var baseUrl = "../../collection";

    this.list = list;
    this.listPromise = null;

    //------------------------------

    function list(){
      if(!this.listPromise){
        var defer = $q.defer();
        this.listPromise = defer.promise;
        _call(baseUrl, defer.resolve, defer.reject);
      }
      return this.listPromise;
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

  }

})();


