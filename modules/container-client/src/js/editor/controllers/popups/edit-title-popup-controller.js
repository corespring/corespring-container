angular.module('corespring-editor.controllers').controller('EditTitlePopupController', [
  '$scope',
  '$modalInstance',
  'title',
  function($scope, $modalInstance, title){

    $scope.title = title;

    $scope.ok = function(){
      $modalInstance.close($scope.title);
    };

    $scope.cancel = function(){
      $modalInstance.dismiss('cancel') ;
    };

  }]);
