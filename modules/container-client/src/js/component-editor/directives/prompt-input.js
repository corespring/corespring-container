angular.module('corespring-singleComponentEditor.directives')
  .directive('promptInput', [function(){

  function link($scope, $elem, $attrs){}

  var template = [
    '<div>',
    ' <input type="text" ng-model="prompt"></input>',
    '</div>'].join('\n');

  return {
    restrict: 'A',
    link: link,
    transclude: true,
    template: template,
    replace: true,
    scope: {
      prompt: '=',
    }
  };
}]);