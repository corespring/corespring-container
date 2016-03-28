/** see: http://www.bootstrap-switch.org/ */
angular.module('corespring-singleComponentEditor.directives')
.directive(
  'toggleButton', 
  [function(){

  var template = ['<input',
                  ' data-size="mini" data-on-text="&nbsp;&nbsp;"',
                  ' data-off-text="&nbsp;&nbsp;"',
                  ' type="checkbox">'].join('\n');

  function link($scope, $elem){
    $elem.bootstrapSwitch();
    
    $elem.on('switchChange.bootstrapSwitch', function(event, state) {
      $scope.ngModel = state;
      $scope.$digest();
    });

    $scope.$watch('ngModel', function(state){
      if(state !== undefined){
        $elem.bootstrapSwitch('state', state, true);
      }
    });
  }

  return {
    restrict: 'AE',
    link:link,
    transclude: false,
    template: template,
    replace: true, 
    scope: {
      ngModel: '=',
    }
  };
}]);