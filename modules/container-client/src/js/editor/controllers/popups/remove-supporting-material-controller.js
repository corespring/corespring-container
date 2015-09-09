angular.module('corespring-editor.controllers')
  .controller('RemoveSupportingMaterialPopupController', [
  '$scope',
  '$modalInstance',
  'name',
  function($scope, $modalInstance, name){

    $scope.name = name;

    $scope.ok = function(){
      $modalInstance.close($scope.supportingMaterial);
    };

    $scope.cancel = function(){
      $modalInstance.dismiss();
    };
  }]);