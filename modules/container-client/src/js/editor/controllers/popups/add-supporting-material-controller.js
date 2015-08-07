angular.module('corespring-editor.controllers').controller('AddSupportingMaterialPopupController', [
  '$scope',
  '$modalInstance',
  'LogFactory',
  'materialNames',
  function($scope, $modalInstance, LogFactory, materialNames){

    var logger = LogFactory.getLogger('AddSupportingMaterialPopupController');

    $scope.materialNames = materialNames;

    $scope.supportingMaterial = {
      source: 'html'
    };

    $scope.$watch('metadataIsValid', function(isValid){
      $scope.okDisabled = !isValid;
    });

    $scope.ok = function(){
      $modalInstance.close($scope.supportingMaterial);
    };

    $scope.cancel = function(){
      $modalInstance.dismiss();
    };
  }]);