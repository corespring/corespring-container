angular.module('corespring-catalog.controllers')
  .controller('CatalogRoot', [
    '$scope', '$log', 'SupportingMaterialsService',
    function($scope, $log, SupportingMaterialsService) {

      var log = $log.debug.bind($log, '[catalog root] -');

      $scope.$on('itemLoaded', function(ev, item) {
        $scope.supportingMaterials = SupportingMaterialsService.getSupportingMaterialsByGroups(item.supportingMaterials);
      });
    }

  ]);