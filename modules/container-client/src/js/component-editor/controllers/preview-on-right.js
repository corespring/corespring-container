angular.module('corespring-singleComponentEditor.controllers')
  .controller('PreviewOnRight', [
    '$scope',
    function($scope) {

      $scope.showPreview = true;

      $scope.$on('showPreview', function(show){
        $scope.showPreview = show;
      });
}]);