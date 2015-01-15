angular.module('corespring-catalog.controllers')
  .controller('CatalogRoot', [
    '$scope', 'LogFactory', 'SupportingMaterialsService', 'ItemService',
    function($scope, LogFactory, SupportingMaterialsService, ItemService) {

      var log = LogFactory.getLogger('CatalogRoot');

      $scope.$on('itemLoaded', function(ev, item) {
        $scope.supportingMaterials = SupportingMaterialsService.getSupportingMaterialsByGroups(item.supportingMaterials);
      });

      $scope.onLoaded = function(item) {
        log.debug('loaded', arguments);
        $scope.item = item;
      };

      $scope.onLoadFailed = function() {
        log.debug('load failed', arguments);
      };

      ItemService.load($scope.onLoaded, $scope.onUploadFailed);
    }

  ]);