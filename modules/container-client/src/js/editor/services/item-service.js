angular.module('corespring-editor.services').service('ItemService', [
  '$http','ItemUrls', 'LogFactory',  
  function($http, ItemUrls, LogFactory){

    /**
     * Service that contains xhr calls to the server.
     * Does some client caching of data and call queuing to minimize calls to server.
     */
    function ItemService(){

      var logger = LogFactory.getLogger('ItemService');

      function addQueryParamsIfPresent(path) {
        var href = document.location.href;
        return  path + (href.indexOf('?') === -1 ? '' :  '?' + href.split('?')[1]);
      }

      var loadedData = null;
      
      var loadQueue = [];

      var loadInProgress = false;

      function flushQueue(d, callbackName){
        logger.debug('flushQueue: ', callbackName, 'no of items:', loadQueue.length);
        _.forEach(loadQueue, function(cbs){
          if(cbs[callbackName]){
            cbs[callbackName](d);
          }
        });
        loadQueue = [];
      }

      this.load = function(onSuccess, onFailure){
        
        logger.debug('load, loaded?', loadedData !== null);

        if(loadedData){
          onSuccess(loadedData);
        } else {
          
          loadQueue.push({success: onSuccess, failure: onFailure});

          if(loadInProgress){
            logger.debug('load in progress - wait');
            return;
          }

          try{
            loadInProgress = true;
            var finalUrl = addQueryParamsIfPresent(ItemUrls.load.url);
            $http[ItemUrls.load.method](finalUrl)
              .success(function(data, status, headers, config){
                loadedData = data;
                loadInProgress = false;
                flushQueue(data, 'success');
              })
              .error(function(data, status, headers, config){
                loadInProgress = false;
                flushQueue(data, 'failure');
              });
          } catch (e){
            logger.error(e);
            loadInProgress = false;
          }
        }
      };

      var saveListeners = {};

      this.addSaveListener = function(id,handler){
        saveListeners[id] = handler;
      };

      function notifyListeners(message){
        _.forIn(saveListeners, function(listener, key){
          if(listener.handleSaveMessage){
            listener.handleSaveMessage(message);
          } else {
            logger.warn('listener with id:', key, 'has no function called handleSaveMessage');
          }
        });
      }

      this.saveSupportingMaterial = function(data, onSuccess, onFailure) {
        this.save(data, onSuccess, onFailure);
      };

      this.fineGrainedSave = function(data, onSuccess, onFailure){
        logger.debug('save', data );
        var url = addQueryParamsIfPresent(ItemUrls.fineGrainedSave.url);
        
        notifyListeners('saving') ;
        $http[ItemUrls.fineGrainedSave.method](url, data)
          .success(function(data, status, headers, config) {
            notifyListeners('saved');
            if(onSuccess){
              onSuccess(data);
            } else {
              logger.error('no onSuccess handler');
            }
          })
          .error(function(data, status, headers, config) {
            notifyListeners('error');
            if(onFailure) {
              data = data || { error: status + ": an unknown error occured" };
              onFailure(data);
            }
          });
      };

      this.save = function(data, onSuccess, onFailure){
        logger.debug('save', data );
        var url = addQueryParamsIfPresent(ItemUrls.save.url);
        $http[ItemUrls.save.method](url, data)
          .success(function(data, status, headers, config) {
            loadedData = data;

            if(onSuccess){
              onSuccess(loadedData);
            } else {
              logger.error('no onSuccess handler');
            }
          })
          .error(function(data, status, headers, config) {
            if( onFailure ) {
              data = data || { error: status + ": an unknown error occured" };
              onFailure(data);
            }
          });
      };
    }

    return new ItemService();
  }]);