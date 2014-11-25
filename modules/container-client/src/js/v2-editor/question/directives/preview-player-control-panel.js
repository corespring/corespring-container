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

      }

    return {
      restrict: 'AE',
      link: link,
      scope: {
        mode: '=',
        score: '='
      },
      templateUrl: '/v2-editor/question/directives/preview-player-control-panel.html'
    };
  }
]);

