/* global MathJax */
angular.module('corespring-common.services')
  .service('QueryParamUtils', [ 'QUERY_PARAMS',

    function(QUERY_PARAMS) {

      function QueryParamUtils() {
        this.getQueryParams = function() {
          return QUERY_PARAMS;
        };

        this.addQueryParams = function(path) {
          path = path || '';
          path = path.indexOf('?') === -1 ? path : path.split('?')[0];

          var params = _.reduce(QUERY_PARAMS, function(sum, value, key){
            return sum.concat(key + '=' + value);
          }, []).join('&');

          return path + '?' + params;
        };
      }
      
      return new QueryParamUtils();
    }
  ]);