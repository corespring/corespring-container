angular.module('corespring-editor.directives')
  .directive('previewPlayerControlPanel', ['$log',
    function($log){
      
      function link($scope, $element, $attrs){

        $scope.submit = function(){
          $scope.$emit('playerControlPanel.submit');
        };

        $scope.reset = function(){
          $scope.$emit('playerControlPanel.reset');
        };

        $scope.isNumber= function (n) {
          return !isNaN(parseFloat(n)) && isFinite(n);
        };
      }

    return {
      restrict: 'AE',
      link: link,
      scope: {
        mode: '=',
        score: '='
      },
      templateUrl: '/editor/question/directives/preview-player-control-panel.html'
    };
  }
]);

