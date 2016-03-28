angular.module('corespring-singleComponentEditor.directives')
.directive(
  'toggleButton', 
  [function(){

  var template = ['<input ng-click="onClicked()" data-size="mini" data-on-text="" data-off-text="" type="checkbox" checked="checked">'].join('\n');

  function link($scope, $elem){
    $elem.bootstrapSwitch();

    $scope.onClicked = function(){
      console.log('clicked..');
      $scope.checked = !$scope.checked;
      $scope.$digest();
    };

  }

  return {
    restrict: 'AE',
    link:link,
    transclude: false,
    template: template,
    replace: true, 
    scope: {
      checked: '=',
    }
  };
}]);