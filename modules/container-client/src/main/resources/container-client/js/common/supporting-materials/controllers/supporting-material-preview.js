var controller = function(
  $scope, $stateParams, $log, SupportingMaterialsService) {

  var log = $log.debug.bind($log, '[supporting-materials-preview] -');

  $scope.index = parseInt($stateParams.index, 10);

  function supportingMaterials() {
    return ($scope.data && $scope.data.item) ? $scope.data.item.supportingMaterials : undefined;
  }

  function fileIndex() {
    if (supportingMaterials() && $scope.data.item && ($scope.index >= 0)) {
      return _.findIndex(supportingMaterials()[$scope.index].files, SupportingMaterialsService.isDefault);
    } else {
      return undefined;
    }
  }

  $scope.getSupportingMarkup = function() {
    var supportingMaterial = SupportingMaterialsService.getSupportingMaterialFile(supportingMaterials(), $scope.index);
    return supportingMaterial ? supportingMaterial.content : undefined;
  };

  $scope.getSupportingUrl = function() {
    return SupportingMaterialsService.getSupportingUrl(supportingMaterials(), $scope.index);
  };

  $scope.previewable = SupportingMaterialsService.previewable(supportingMaterials(), $scope.index);
  $scope.supportingUrl = $scope.getSupportingUrl();
  $scope.supportingMarkup = $scope.getSupportingMarkup();
  $scope.fileIndex = fileIndex();
  log("fileIndex = " + $scope.fileIndex);
  $scope.getContentType = function() {
    return supportingMaterials() ?
      SupportingMaterialsService.getContentType(supportingMaterials(), $scope.index) : undefined;
  };

  $scope.$on('itemLoaded', function() {
    $scope.supportingUrl = $scope.getSupportingUrl();
    $scope.supportingMarkup = $scope.getSupportingMarkup();
    $scope.fileIndex = fileIndex();
    log("fileIndex = " + $scope.fileIndex);
    $scope.previewable = SupportingMaterialsService.previewable(supportingMaterials(), $scope.index);
  });

};

angular.module('corespring-common.supporting-materials.controllers')
  .controller('SupportingMaterialPreview', ['$scope',
    '$stateParams',
    '$log',
    'SupportingMaterialsService',
    controller
  ]);