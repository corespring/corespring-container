angular.module('corespring-editor.services').service('ItemService', [
  '$http', 
  '$timeout', 
  'ItemUrls', 
  'LogFactory',
  'RawFileUploader',
  function($http, $timeout, ItemUrls, LogFactory, RawFileUploader) {

    /**
     * Service that contains xhr calls to the server.
     * Does some client caching of data and call queuing to minimize calls to server.
     */
    function ItemService() {

      var logger = LogFactory.getLogger('item-service');

      var loadQueue = [];
      var loadedData = null;
      var loadInProgress = false;
      var saveListeners = {};

      this.addSaveListener = function(id, handler) {
        saveListeners[id] = handler;
      };

      function uploadFile(m, onSuccess, onFailure){
        var url = ItemUrls.createSupportingMaterialFromFile.url;
        url = url
          .replace(':materialType', m.materialType)
          .replace(':filename', m.file.name);

        url = addQueryParamsIfPresent(url);
        url += getToken(url) +'name=' + m.name;

        RawFileUploader.upload(url, m.file, function(err, url){
          onSuccess(url);
        }, function(err){
          logger.error(err);
          onFailure(err);
        });
      }

      function getToken(url){
        return url.indexOf('?' === -1) ? '?' : '&';
      }

      this.createSupportingMaterial = function(m, onSuccess, onFailure){
        if(m.file){
          uploadFile(m, onSuccess, onFailure);
        } else {
          var c = ItemUrls.createSupportingMaterial;
          var url = addQueryParamsIfPresent(c.url);
          m.html = '<div>' + m.name + '</div>';
          $http[c.method](url, m)
            .success(onSuccess)
            .error(onFailure || function(){
              logger.error(arguments);
            });
        }
      };

      this.load = function(onSuccess, onFailure) {
        logger.debug('load, loaded?', loadedData !== null);

        loadQueue.push({
          success: onSuccess,
          failure: onFailure
        });

        if (loadedData) {
          flushQueue(loadedData, 'success');
          return;
        }

        if (loadInProgress) {
          logger.debug('load in progress - wait');
          return;
        }

        try {
          loadInProgress = true;
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
          flushQueue(data, 'success');
        }

        function loadItemError(data, status, headers, config) {
          loadInProgress = false;
          flushQueue(data, 'failure');
        }
      };

      this.saveComponents = function(data, onSuccess, onFailure) {
        save('components', data, onSuccess, onFailure);
      };

      this.saveCustomScoring = function(data, onSuccess, onFailure) {
        save('custom-scoring', {
          customScoring: data
        }, onSuccess, onFailure);
      };

      this.saveProfile = function(data, onSuccess, onFailure) {
        save('profile', data, onSuccess, onFailure);
      };

      this.saveSummaryFeedback = function(data, onSuccess, onFailure) {
        save('summary-feedback', {
          summaryFeedback: data
        }, onSuccess, onFailure);
      };

      this.saveSupportingMaterials = function(data, onSuccess, onFailure) {
        save('supporting-materials', data, onSuccess, onFailure);
      };

      this.saveXhtml = function(data, onSuccess, onFailure) {
        save('xhtml', {
          xhtml: data
        }, onSuccess, onFailure);
      };

      this.saveCollectionId = function(data, onSuccess, onFailure) {
        save('collection-id', {
          collectionId: data
        }, onSuccess, onFailure);
      };

      this.saveAll = function(data, onSuccess, onFailure) {
        var method = ItemUrls.save.method;
        var url = ItemUrls.save.url;
        url = addQueryParamsIfPresent(url);
        logger.debug('saveAll', data);
        logger.debug('saveAll - url:', url);

        notifyListeners('saving');

        $http[method](url, data)
          .success(saveSuccess)
          .error(saveError);

        function saveSuccess(data) {
          notifyListeners('saved');
          if (onSuccess) {
            onSuccess(data);
          } else {
            logger.warn('no onSuccess handler');
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
      };

      function save(set, data, onSuccess, onFailure) {
        var method = ItemUrls.saveSubset.method;
        var url = ItemUrls.saveSubset.url.replace(':subset', set);
        url = addQueryParamsIfPresent(url);
        logger.debug('save', data);
        logger.debug('save - url:', url);

        notifyListeners('saving');

        $http[method](url, data)
          .success(saveSuccess)
          .error(saveError);

        function saveSuccess(data, status, headers, config) {
          notifyListeners('saved');
          if (onSuccess) {
            onSuccess(data);
          } else {
            logger.warn('no onSuccess handler');
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
            logger.warn('listener with id:', key, 'has no function called handleSaveMessage');
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
              logger.warn('error in callback', e);
            }
          });
        loadQueue = [];
      }
    }

    return new ItemService();
  }]);