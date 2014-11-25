angular.module('corespring-editor.directives')
  .directive('previewPlayerControlPanel', ['$compile', '$log',

    function(){
      
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
        settings: '=',
        mode: '=',
        score: '=',
        showPreviewButton: '@'
      },
      templateUrl: '/v2-editor/question/directives/preview-player-control-panel.html'
      };
  }
]);

