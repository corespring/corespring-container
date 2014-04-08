var controller = function(
  $scope, $stateParams, $log, SupportingMaterialsService) {

  var log = $log.debug.bind($log, '[supporting-materials-preview] -');

  $scope.index = parseInt($stateParams.index, 10);

  function supportingMaterials() {
    return $scope.data.item.supportingMaterials;
  }

  $scope.getSupportingUrl = function(index) {
    if ($scope.data.item) {
      return SupportingMaterialsService.getSupportingUrl(supportingMaterials(), $scope.index);
    }
  };

  $scope.previewable = SupportingMaterialsService.previewable(supportingMaterials(), $scope.index);
  $scope.supportingUrl = $scope.getSupportingUrl($scope.index);

  log('supporting url', $scope.supportingUrl);

  $scope.$on('itemLoaded', function() {
    $scope.supportingUrl = $scope.getSupportingUrl($scope.index);
    log('supporting url', $scope.supportingUrl);
    $scope.previewable = SupportingMaterialsService.previewable(supportingMaterials(), $scope.index);
  });

};

angular.module('corespring-editor.controllers')
  .controller('SupportingMaterialPreview', ['$scope',
    '$stateParams',
    '$log',
    'SupportingMaterialsService',
    controller
  ]);