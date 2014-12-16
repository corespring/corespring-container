angular.module('corespring-editor.controllers').controller('EditTitlePopupController', [
  '$scope',
  '$modalInstance',
  'title',
  function($scope, $modalInstance, title){

    $scope.title = title;

    $scope.ok = function(){
      /**
      Note: for some reason the $scope provided has a child scope that is bound to the view
      We are getting the title from the child until we figure out why this is happening.
      */
      var t = $scope.$$childTail.title;
      $modalInstance.close(t);
    };

    $scope.cancel = function(){
      $modalInstance.dismiss('cancel') ;
    };

  }]);
