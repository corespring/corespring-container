angular.module('corespring-singleComponentEditor.controllers')
  .controller('PreviewOnRight', [
    '$scope',
    'Msgr',
    function($scope, Msgr) {

      $scope.showPreview = true;

      $scope.$on('initMsgrHandlers', function(){
        Msgr.on('showPreview', function(show){
          
          if(show){
            $scope.item.components[$scope.componentKey] = $scope.getData();
          }
          $scope.showPreview = show;
        });
      });

    }]);