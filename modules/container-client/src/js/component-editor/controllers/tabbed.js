angular.module('corespring-singleComponentEditor.controllers')
  .controller('Tabbed', [
    '$scope',
    'Msgr',
    function($scope, Msgr) {

      $scope.showNavigation = false;
      $scope.activePane = 'config';

      $scope.$watch('activePane', function(a){
        if(a === 'config'){
          $scope.configActive = true;
          $scope.previewActive = false;
        } else {
          $scope.configActive = false;
          $scope.previewActive = true;
        }
      });

      $scope.showConfig = function(done){
        done = done || function(){};
        $scope.activePane = 'config';
        done();
      };

      $scope.showPreview = function(done){
        done = done || function(){};
        $scope.item.components[$scope.componentKey] = $scope.getData();
        $scope.activePane = 'preview';
      };

      $scope.$on('initMsgrHandlers', function(){
        Msgr.on('showNavigation', function(showNavigation){
          $scope.showNavigation = showNavigation;
        });

        Msgr.on('showPane', function(pane, done){
          if(pane === 'config'){
            $scope.showConfig();
          } else if(pane === 'preview'){
            $scope.showPreview();
          }
        });
      });

    }]);