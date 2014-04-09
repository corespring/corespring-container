var controller = function(
  $scope, $stateParams, $log, SupportingMaterialsService) {

  var log = $log.debug.bind($log, '[supporting-materials-preview] -');

  $scope.index = parseInt($stateParams.index, 10);

  function supportingMaterials() {
    return $scope.data.item.supportingMaterials;
  }

  $scope.getSupportingMarkup = function() {
    var supportingMaterial = SupportingMaterialsService.getSupportingMaterial(supportingMaterials(), $scope.index);
    return supportingMaterial ? supportingMaterial.content : undefined;
  };

  $scope.getSupportingUrl = function(index) {
    if ($scope.data.item) {
      return SupportingMaterialsService.getSupportingUrl(supportingMaterials(), $scope.index);
    }
  };

  $scope.previewable = SupportingMaterialsService.previewable(supportingMaterials(), $scope.index);
  $scope.supportingUrl = $scope.getSupportingUrl($scope.index);
  $scope.supportingMarkup = $scope.getSupportingMarkup();
  $scope.getContentType = function() {
    return supportingMaterials() ?
      SupportingMaterialsService.getContentType(supportingMaterials(), $scope.index) : undefined;
  };

  $scope.$on('itemLoaded', function() {
    $scope.supportingUrl = $scope.getSupportingUrl($scope.index);
    $scope.supportingMarkup = $scope.getSupportingMarkup();
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