angular.module('corespring-editor.controllers').controller('AddSupportingMaterialPopupController', [
  '$timeout',
  '$scope',
  '$modalInstance',
  'LogFactory',
  'materialNames',
  function($timeout, $scope, $modalInstance, LogFactory, materialNames){

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

    //Note: rendered would be preferable but is only in later versions of bootstrap-modal
    $modalInstance.opened.then(function(){
      $timeout(function(){
        $scope.$broadcast('metadata.focus-title');
      }, 200);
    });
  }]);