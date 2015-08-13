angular.module('corespring-editor.controllers').controller('QuestionInformationPopupController', [
  '$scope',
  'LogFactory',
  '$modal',
  'SupportingMaterialsService',
  'item',
  function($scope, LogFactory, $modal, SupportingMaterialsService, item) {
    $scope.item = item;
    $scope.activeTab = 'question';
    $scope.playerMode = "gather";
    //$scope.supportingMaterials = SupportingMaterialsService.getSupportingMaterialsByGroups(item.supportingMaterials);
  }]);
