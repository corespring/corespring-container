angular.module('corespring-editor.controllers').controller('EditTitlePopupController', [
  '$scope',
  'LogFactory',
  '$modalInstance',
  'title',
  function($scope, LogFactory, $modalInstance, title){

    $scope.title = title;

    $scope.ok = function(){
      $modalInstance.close($scope.title);
    };

    $scope.cancel = function(){
      $modalInstance.dismiss('cancel') ;
    };

  }]);
