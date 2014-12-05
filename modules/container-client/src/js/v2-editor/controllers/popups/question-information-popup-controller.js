angular.module('corespring-editor.controllers').controller('QuestionInformationPopupController', [
  '$scope',
  'LogFactory',
  '$modal',
  'SupportingMaterialsService',
  'item',
  function($scope, LogFactory, $modal, SupportingMaterialsService, item) {
    $scope.item = item;
    $scope.activeTab = 'question';

    $scope.supportingMaterials = SupportingMaterialsService.getSupportingMaterialsByGroups(item.supportingMaterials);

    $scope.selectTab = function(tab) {
      $scope.activeTab = tab;
      $scope.activeSmIndex =  $scope.selectedSupportingMaterialUrl = $scope.selectedSupportingMaterialContent = undefined;
    };

    $scope.selectSupportingMaterial = function(smIndex) {
      $scope.activeTab = 'supportingMaterial';
      $scope.activeSmIndex =  smIndex;

      $scope.selectedSupportingMaterialName = SupportingMaterialsService.getSupportingName($scope.item.supportingMaterials, smIndex);
      $scope.selectedSupportingMaterialUrl = SupportingMaterialsService.getSupportingUrl($scope.item.supportingMaterials, smIndex);
      $scope.selectedSupportingMaterialContent = SupportingMaterialsService.getContent($scope.item.supportingMaterials, smIndex);
    };

    $scope.getContentType = function() {
      return SupportingMaterialsService.getContentType(item.supportingMaterials, $scope.activeSmIndex);
    };

  }]);
