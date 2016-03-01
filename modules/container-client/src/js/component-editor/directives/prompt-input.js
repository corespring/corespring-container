angular.module('corespring-singleComponentEditor.directives')
  .directive('promptInput', [function(){

  function link($scope, $elem, $attrs){
    console.log('prompt: ' + $scope.prompt);
  }

  var template = [
    '<div>',
    ' <input type="text" ng-model="prompt"></input>',
    '</div>'].join('\n');

  return {
    restrict: 'A',
    link: link,
    template: template,
    replace: true,
    scope: {
      prompt: '=ngModel',
    }
  };
}]);