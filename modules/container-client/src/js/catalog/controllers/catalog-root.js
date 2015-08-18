angular.module('corespring-catalog.controllers')
  .controller('CatalogRoot', [
    '$scope', 'LogFactory', 'ItemService', 'iFrameService', 'Msgr', '$location',

    function($scope, LogFactory, ItemService, iFrameService, Msgr, $location) {

      var log = LogFactory.getLogger('CatalogRoot');

      function preprocessComponents(item) {
        _.each(item.components, function(c, key) {
          var serverLogic = corespring.server.logic(c.componentType);
          if (serverLogic.preprocess) {
            //TODO: This is part of a larger task to add preprocess to the container
            //@see: https://thesib.atlassian.net/browse/CA-842
            item.components[key] = serverLogic.preprocess(c);
          }
        });
      }

      var tabs = $location.search().tabs;

      function toPair(k){
        return [k, true];
      }

      if (tabs) {
        $scope.tabs = _(tabs.split(',')).map(toPair).zipObject().value();
      } else {
        $scope.tabs = {profile: true, question: true, supportingMaterial: true};
      }

      $scope.onLoaded = function(item) {
        log.debug('loaded', arguments);
        $scope.item = item;
        preprocessComponents(item);
      };

      $scope.onLoadFailed = function() {
        log.debug('load failed', arguments);
      };

      ItemService.load($scope.onLoaded, $scope.onUploadFailed);

      if (iFrameService.isInIFrame()) {
        Msgr.on('initialise', function(data) {
          Msgr.send('rendered');
        });
        Msgr.send('ready');
      }
    }

  ]);