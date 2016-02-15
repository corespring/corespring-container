angular.module('corespring-singleComponentEditor.directives')
  .directive('simplePlayerButton', [function(){

  function link($scope, $elem, $attrs){

    var labels = {
      gather: 'Submit',
      view: 'Reset',
      evaluate: 'Reset'
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
  }

  var template = [
    '<button ng-click="onClick()"',
    ' class="btn btn-xs" ', 
    ' ng-class="{gather: \'btn-success\', view: \'btn-info\', evaluate: \'btn-info\'}[mode]">',
    '{{label}}</button>'].join('\n');

  return {
    restrict: 'A',
    link: link,
    template: template,
    replace: true,
    scope: {
      mode: '=' 
    }
  };
}]);