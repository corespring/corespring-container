angular.module('corespring-singleComponentEditor.directives')
  .directive('simplePlayerButton', [function(){

  function link($scope, $elem, $attrs){

    var labels = {
      gather: 'Submit Answer',
      view: 'Reset Answer',
      evaluate: 'Reset Answer'
    };

    $scope.$watch('mode', function(m){
      $scope.label = labels[m] || '??';
    });
    
    $scope.onClick = function(){
      if($scope.mode === 'gather'){
        $scope.$emit('playerControlPanel.submit');
      } else if($scope.mode === 'view' || $scope.mode === 'evaluate'){
        $scope.$emit('playerControlPanel.reset');
      }
    };

    $scope.isNumber= function (n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    };

  }

  var template = [
    '<div>',
    '  <button ng-click="onClick()"',
    '      class="btn btn-xs"',
    '      ng-class="{gather: \'btn-success\', view: \'btn-info\', evaluate: \'btn-info\'}[mode]">',
    '    {{label}}',
    '  </button>',
    '  <span class="score">',
    '    <label ng-show="isNumber(score.summary.percentage)">',
    '      Score: {{score.summary.percentage}}%',
    '    </label>',
    '  </span>',
    '</div>'].join('\n');

  return {
    restrict: 'A',
    link: link,
    template: template,
    replace: true,
    scope: {
      score: '=',
      mode: '=' 
    }
  };
}]);