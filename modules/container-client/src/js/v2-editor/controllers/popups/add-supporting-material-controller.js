angular.module('corespring-editor.controllers').controller('AddSupportingMaterialPopupController', [
  '$scope',
  '$modalInstance',
  'LogFactory',
  function($scope, $modalInstance, LogFactory){

    var logger = LogFactory.getLogger('AddSupportingMaterialPopupController');

    $scope.supportingMaterial = {method: 'uploadFile'};

    function isUploadFileEmpty() {
      return $scope.supportingMaterial.method === 'uploadFile' && _.isEmpty($scope.supportingMaterial.fileToUpload);
    }

    $scope.isSubmitDisabled = function() {
      return _.isEmpty($scope.supportingMaterial.name) || isUploadFileEmpty();
    };

    $scope.$watch($scope.isSubmitDisabled, function(n) {
      $scope.okDisabled = n;
    });

    $scope.$on('fileChange', function(ev, file) {
      $scope.supportingMaterial.fileToUpload = file;
    });

    $scope.ok = function(){
      $modalInstance.close($scope.supportingMaterial);
    };

    $scope.cancel = function(){
      $modalInstance.dismiss();
    };
  }]).directive('filechange', function () {
    var linker = function ($scope, element, attributes) {
      element.bind('change', function (event) {
        $scope.$emit('fileChange', $(element)[0].files[0]);
        $scope.$apply();
      });
    };

    return {
      restrict: 'A',
      link: linker
    };

  });
