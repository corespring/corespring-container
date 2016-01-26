angular.module('corespring-singleComponentEditor.services')
.service('ItemService', [
  '$http', 
  '$timeout', 
  'ItemUrls', 
  'LogFactory',
  function($http, $timeout, ItemUrls, LogFactory) {

    /**
     * Service that contains xhr calls to the server.
     * Does some client caching of data and call queuing to minimize calls to server.
     */
    function ItemService() {

      var logger = LogFactory.getLogger('item-service');

      this.load = function(onSuccess, onFailure, force) {
        logger.debug('load, loaded?');

        try {
          var finalUrl = addQueryParamsIfPresent(ItemUrls.load.url);
          $http[ItemUrls.load.method](finalUrl)
            .success(loadItemSuccess)
            .error(loadItemError);
        } catch (e) {
          logger.error(e);
          loadInProgress = false;
        }

        function loadItemSuccess(data, status, headers, config) {
          loadedData = data;
          loadInProgress = false;
          onSuccess(data);
        }

        function loadItemError(data, status, headers, config) {
          loadInProgress = false;
        }
      };

      this.save = function(data, onSuccess, onFailure) {
        save('components', data, onSuccess, onFailure);
      };

      function save(set, data, onSuccess, onFailure) {
        var method = ItemUrls.saveSubset.method;
        var url = ItemUrls.saveSubset.url.replace(':subset', set);
        url = addQueryParamsIfPresent(url);
        logger.debug('save', data);
        logger.debug('save - url:', url);

        $http[method](url, data)
          .success(saveSuccess)
          .error(saveError);

        function saveSuccess(data, status, headers, config) {
          if (onSuccess) {
            onSuccess(data);
          } else {
            logger.warn('no onSuccess handler');
          }
        }

        function saveError(data, status, headers, config) {
          if (onFailure) {
            data = data || {
              error: status + ": an unknown error occurred"
            };
            onFailure(data);
          }
        }
      }

      function addQueryParamsIfPresent(path) {
        var href = document.location.href;
        return path + (href.indexOf('?') === -1 ? '' : '?' + href.split('?')[1]);
      }

    }

    return new ItemService();
  }]);