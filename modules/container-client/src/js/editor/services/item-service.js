angular.module('corespring-editor.services').service('ItemService', [
  '$http', '$timeout', 'ItemUrls', 'LogFactory', 'Msgr',
  function($http, $timeout, ItemUrls, LogFactory, Msgr) {

    /**
     * Service that contains xhr calls to the server.
     * Does some client caching of data and call queuing to minimize calls to server.
     */
    function ItemService() {

      var $log = LogFactory.getLogger('ItemService');

      var loadQueue = [];
      var loadedData = null;
      var loadInProgress = false;
      var saveListeners = {};

      this.addSaveListener = addSaveListener;
      this.load = loadItem;
      this.saveAll = saveAll;
      this.saveComponents = saveComponents;
      this.saveCollectionId = saveCollectionId;
      this.saveCustomScoring = saveCustomScoring;
      this.saveProfile = saveProfile;
      this.saveSummaryFeedback = saveSummaryFeedback;
      this.saveSupportingMaterials = saveSupportingMaterials;
      this.saveXhtml = saveXhtml;

      //--------------------------------------

      function addSaveListener(id, handler) {
        saveListeners[id] = handler;
      }

      function loadItem(onSuccess, onFailure) {
        $log.debug('load, loaded?', loadedData !== null);

        loadQueue.push({
          success: onSuccess,
          failure: onFailure
        });

        if (loadedData) {
          flushQueue(loadedData, 'success');
          return;
        }

        if (loadInProgress) {
          $log.debug('load in progress - wait');
          return;
        }

        try {
          loadInProgress = true;
          var finalUrl = addQueryParamsIfPresent(ItemUrls.load.url);
          $http[ItemUrls.load.method](finalUrl)
            .success(loadItemSuccess)
            .error(loadItemError);
        } catch (e) {
          $log.error(e);
          loadInProgress = false;
        }

        function loadItemSuccess(data, status, headers, config) {
          loadedData = data;
          loadInProgress = false;
          flushQueue(data, 'success');
        }

        function loadItemError(data, status, headers, config) {
          loadInProgress = false;
          flushQueue(data, 'failure');
        }
      }

      function saveComponents(data, onSuccess, onFailure) {
        save('components', data, onSuccess, onFailure);
      }

      function saveCustomScoring(data, onSuccess, onFailure) {
        save('custom-scoring', {
          customScoring: data
        }, onSuccess, onFailure);
      }

      function saveProfile(data, onSuccess, onFailure) {
        save('profile', data, function() {
          Msgr.send('profileSaved');
          onSuccess.apply(this, arguments);
        }, onFailure);
      }

      function saveSummaryFeedback(data, onSuccess, onFailure) {
        save('summary-feedback', {
          summaryFeedback: data
        }, onSuccess, onFailure);
      }

      function saveSupportingMaterials(data, onSuccess, onFailure) {
        save('supporting-materials', data, onSuccess, onFailure);
      }

      function saveXhtml(data, onSuccess, onFailure) {
        save('xhtml', {
          xhtml: data
        }, onSuccess, onFailure);
      }

      function saveCollectionId(data, onSuccess, onFailure) {
        save('collection-id', {
          collectionId: data
        }, onSuccess, onFailure);
      }

      function saveAll(data, onSuccess, onFailure) {
        var method = ItemUrls.save.method;
        var url = ItemUrls.save.url;
        url = addQueryParamsIfPresent(url);
        $log.debug('saveAll', data);
        $log.debug('saveAll - url:', url);

        notifyListeners('saving');

        $http[method](url, data)
          .success(saveSuccess)
          .error(saveError);

        function saveSuccess(data) {
          notifyListeners('saved');
          if (onSuccess) {
            onSuccess(data);
          } else {
            $log.warn('no onSuccess handler');
          }
        }

        function saveError(data, status) {
          notifyListeners('error');
          if (onFailure) {
            data = data || {
              error: status + ": an unknown error occurred"
            };
            onFailure(data);
          }
        }
      }

      function save(set, data, onSuccess, onFailure) {
        var method = ItemUrls.saveSubset.method;
        var url = ItemUrls.saveSubset.url.replace(':subset', set);
        url = addQueryParamsIfPresent(url);
        $log.debug('save', data);
        $log.debug('save - url:', url);

        notifyListeners('saving');

        $http[method](url, data)
          .success(saveSuccess)
          .error(saveError);

        function saveSuccess(data, status, headers, config) {
          notifyListeners('saved');
          if (onSuccess) {
            onSuccess(data);
          } else {
            $log.warn('no onSuccess handler');
          }
        }

        function saveError(data, status, headers, config) {
          notifyListeners('error');
          if (onFailure) {
            data = data || {
              error: status + ": an unknown error occurred"
            };
            onFailure(data);
          }
        }
      }

      function notifyListeners(message) {
        _.forIn(saveListeners, function(listener, key) {
          if (listener.handleSaveMessage) {
            listener.handleSaveMessage(message);
          } else {
            $log.warn('listener with id:', key, 'has no function called handleSaveMessage');
          }
        });
      }

      function addQueryParamsIfPresent(path) {
        var href = document.location.href;
        return path + (href.indexOf('?') === -1 ? '' : '?' + href.split('?')[1]);
      }

      function flushQueue(d, callbackName) {
        _(loadQueue)
          .pluck(callbackName)
          .filter(_.isFunction)
          .forEach(function(callback) {
            try {
              callback(d);
            } catch (e) {
              $log.warn('error in callback', e);
            }
          });
        loadQueue = [];
      }
    }

    return new ItemService();
  }]);