angular.module('corespring-singleComponentEditor.controllers')
  .controller('PreviewOnRight', [
    '$scope',
    function($scope) {

      $scope.$watch('prompt', function(){
        console.log(".....", arguments);
      });
      $scope.showPreview = true;
      $scope.$on('showPreview', function(event, show){
        $scope.showPreview = show;
      });
}]);