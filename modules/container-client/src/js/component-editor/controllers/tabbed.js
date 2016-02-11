angular.module('corespring-singleComponentEditor.controllers')
  .controller('Tabbed', [
    '$scope',
    'Msgr',
    function($scope, Msgr) {

      $scope.showNavigation = false;
      $scope.activePane = 'config';

      $scope.$watch('activePane', function(a){
        if(a === 'preview'){
          $scope.configActive = false;
          $scope.previewActive = true;
        } else {
          $scope.configActive = true;
          $scope.previewActive = false;
        }
      });

      $scope.$on('showPane', function(event, pane){
        $scope.activePane = pane;
      });

      $scope.$on('showNavigation', function(event, showNavigation){
        $scope.showNavigation = showNavigation;
      });

    }]);