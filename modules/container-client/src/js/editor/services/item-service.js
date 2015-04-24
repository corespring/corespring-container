angular.module('corespring-editor.services').service('ItemService', [
  '$http', '$timeout', 'ItemUrls', 'LogFactory',
  function($http, $timeout, ItemUrls, LogFactory) {

    /**
     * Service that contains xhr calls to the server.
     * Does some client caching of data and call queuing to minimize calls to server.
     */
    function ItemService() {

      var logger = LogFactory.getLogger('ItemService');

      function addQueryParamsIfPresent(path) {
        var href = document.location.href;
        return path + (href.indexOf('?') === -1 ? '' : '?' + href.split('?')[1]);
      }

      var loadedData = null;

      var loadQueue = [];

      var loadInProgress = false;

      function flushQueue(d, callbackName) {
        logger.debug('flushQueue: ', callbackName, 'no of items:', loadQueue.length);

        //PE-221 This event may arrive outside of the angular update cycle
        //The angular timeout calls apply on the next occasion
        //This way the callbacks will be called in sync with angular
        $timeout(function() {
          _.forEach(loadQueue, function(cbs) {
            if (cbs[callbackName]) {
              cbs[callbackName](d);
            }
          });
          loadQueue = [];
        });
      }

      this.load = function(onSuccess, onFailure) {
        logger.debug('load, loaded?', loadedData !== null);

        if (loadedData) {
          onSuccess(loadedData);
        } else {

          loadQueue.push({
            success: onSuccess,
            failure: onFailure
          });

          if (loadInProgress) {
            logger.debug('load in progress - wait');
            return;
          }

          try {
            loadInProgress = true;
            var finalUrl = addQueryParamsIfPresent(ItemUrls.load.url);
            $http[ItemUrls.load.method](finalUrl)
              .success(function(data, status, headers, config) {
                loadedData = data;
                loadInProgress = false;
                flushQueue(data, 'success');
              })
              .error(function(data, status, headers, config) {
                loadInProgress = false;
                flushQueue(data, 'failure');
              });
          } catch (e) {
            logger.error(e);
            loadInProgress = false;
          }
        }
      };

      var saveListeners = {};

      this.addSaveListener = function(id, handler) {
        saveListeners[id] = handler;
      };

      function notifyListeners(message) {
        _.forIn(saveListeners, function(listener, key) {
          if (listener.handleSaveMessage) {
            listener.handleSaveMessage(message);
          } else {
            logger.warn('listener with id:', key, 'has no function called handleSaveMessage');
          }
        });
      }

      function save(set, data, onSuccess, onFailure) {
        var method = ItemUrls.saveSubset.method;
        var url = ItemUrls.saveSubset.url.replace(':subset', set);
        url = addQueryParamsIfPresent(url);
        logger.debug('save', data);
        logger.debug('save - url:', url);

        notifyListeners('saving');
        $http[method](url, data)
          .success(function(data, status, headers, config) {
            notifyListeners('saved');
            if (onSuccess) {
              onSuccess(data);
            } else {
              logger.warn('no onSuccess handler');
            }
          })
          .error(function(data, status, headers, config) {
            notifyListeners('error');
            if (onFailure) {
              data = data || {
                error: status + ": an unknown error occured"
              };
              onFailure(data);
            }
          });
      }

      this.saveProfile = function(data, onSuccess, onFailure) {
        save('profile', data, onSuccess, onFailure);
      };

      this.saveComponents = function(data, onSuccess, onFailure) {
        save('components', data, onSuccess, onFailure);
      };

      this.saveXhtml = function(data, onSuccess, onFailure) {
        save('xhtml', {
          xhtml: data
        }, onSuccess, onFailure);
      };

      this.saveSummaryFeedback = function(data, onSuccess, onFailure) {
        save('summary-feedback', {
          summaryFeedback: data
        }, onSuccess, onFailure);
      };

      this.saveCustomScoring = function(data, onSuccess, onFailure) {
        save('custom-scoring', {
          customScoring: data
        }, onSuccess, onFailure);
      };

      this.saveSupportingMaterials = function(data, onSuccess, onFailure) {
        save('supporting-materials', data, onSuccess, onFailure);
      };
    }

    return new ItemService();
  }]);