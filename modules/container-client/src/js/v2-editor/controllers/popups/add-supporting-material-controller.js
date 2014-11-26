angular.module('corespring-editor.controllers').controller('AddSupportingMaterialPopupController', [
  '$scope',
  '$modalInstance',
  'LogFactory',
  'DesignerService',
  function($scope, $modalInstance, LogFactory, DesignerService){

    var logger = LogFactory.getLogger('AddSupportingMaterialPopupController');
    logger.log("CICICIC");
    $scope.supportingMaterial = {};

    $scope.ok = function(){
      $modalInstance.close();
    };

    $scope.cancel = function(){
      $modalInstance.dismiss();
    };
  }]);
