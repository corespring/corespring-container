angular.module('corespring-singleComponentEditor.controllers')
  .controller('Tabbed', [
    '$scope',
    '$timeout',
    function($scope, $timeout) {

      $scope.showNavigation = false;
      $scope.activePane = 'config';

      $scope.showPane = function(pane){
        $scope.activePane = pane;
      };

      $scope.$on('showPane', function(event, pane){
        $scope.showPane(pane);
      });

      $scope.$on('showNavigation', function(event, showNavigation){
        $scope.showNavigation = showNavigation;
      });

    }]);