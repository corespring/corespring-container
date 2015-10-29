(function(){
  function DataQueryService ($http, $log, STATIC_PATHS) {
    console.log("SP", STATIC_PATHS);
    function _call(topic, query, onSuccess, onFailure){
      var url = STATIC_PATHS.dataQuery + '/' + topic;

      if (query) {
       url += '?query=' + encodeURIComponent(JSON.stringify(query));
      }

      $http({method: 'GET', url: url})
        .success( 
          function success(data, status, headers, config){
            $log.debug('success', data);
            onSuccess(data);
        })
        .error(
          function rr(e){
            $log.warn('err: ', e);
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

      var url = STATIC_PATHS.dataQuery + '/' + topic + '/' + id;

      $http({method: 'GET', url: url})
        .success(onSuccess)
        .error(onError);
    };

    /**
     * Create a query object. SearchTerm and fields are optional if you specify filters and vice versa.
     * @param searchTerm The string that all the specified fields are searched for
     * @param fields An array of field names. These fields are compared to searchTerm.
     * @param filters Filters the results. Only items that have the same properties are returned.
     * @returns a query object that can be passed to the query function
     */
    this.createQuery = function(searchTerm, fields, filters) {
      var query = {};
      if (searchTerm) {
        query.searchTerm = searchTerm;
      }
      if (fields && !_.isEmpty(fields)) {
        query.fields = fields;
      }
      if (filters && !_.isEmpty(filters)) {
        query.filters = _.transform(filters,function(result, num, key){
          result.push({field: key, value: filters[key]});
        }, []);
      }
      return query;
    };
  }

  angular.module('corespring-common.services')
    .service('DataQueryService',
      [
      '$http',
      '$log',
      'STATIC_PATHS',
       DataQueryService 
      ]
    );

})();


