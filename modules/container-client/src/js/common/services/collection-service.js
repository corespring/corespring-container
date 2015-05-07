(function(){

  angular.module('corespring-common.services')
    .service('CollectionService',
    [
      '$http',
      '$log',
      CollectionService
    ]
  );

  function CollectionService ($http, $log) {

    var baseUrl = "../../collection";

    function _call(onSuccess, onFailure){
      var url = baseUrl;

      $http({method: 'GET', url: url})
        .success( 
          function success(data, status, headers, config){
            $log.debug("success", data);
            onSuccess(data);
        })
        .error(
          function rr(e){
            $log.warn("err: ", e);
            if(onFailure){
              onFailure(e);
            }
        });
    }

    this.list = function(onSuccess,onFailure){
      _call(onSuccess, onFailure);
    };

  }

})();


