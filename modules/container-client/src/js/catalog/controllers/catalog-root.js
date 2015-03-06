angular.module('corespring-catalog.controllers')
  .controller('CatalogRoot', [
    '$scope', 'LogFactory', 'SupportingMaterialsService', 'ItemService', 'iFrameService', 'Msgr', '$location',

    function($scope, LogFactory, SupportingMaterialsService, ItemService, iFrameService, Msgr, $location) {

      var log = LogFactory.getLogger('CatalogRoot');

      var tabs = $location.search().tabs;

      if (tabs) {
        var tabsArray = tabs.split(',');
        var available = [];
        _.each(tabsArray, function (t) {
          available[t] = true;
        });
        $scope.tabs = available;
      }



      $scope.onLoaded = function(item) {
        log.debug('loaded', arguments);
        $scope.item = item;
        $scope.supportingMaterials = SupportingMaterialsService.getSupportingMaterialsByGroups(item.supportingMaterials);

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