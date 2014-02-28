(function(){
  function DataQueryService ($http, $log) {

    function _call(topic, query, onSuccess, onFailure){
      var url = "../../profile/" + topic;

      if(query){
       url += "?query=" + query;
      }

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

    this.list = function(topic, onSuccess){
      _call(topic, null, onSuccess);
    };

    this.query = function(topic, query, onSuccess, onFailure){

      if(!query){
        onSuccess( [] );
        return;
      }
 
      _call(topic, query, onSuccess, onFailure);
    };

    this.findOne = function(topic, id, onSuccess, onError){

      var url = "../../profile/" + topic + "/" + id;

      $http({method: 'GET', url: url})
        .success(onSuccess)
        .error(onError);
    };
  }

  angular.module('corespring-editor.services')
    .service('DataQueryService',
      [
      '$http',
      '$log',
       DataQueryService 
      ]
    );

})();


