angular.module('corespring-singleComponentEditor.directives.input', [
  'corespring.wiggi-wiz',
  'corespring-editing.wiggi-wiz-features.mathjax'
])
.directive('promptInput', ['WiggiMathJaxFeatureDef',function(WiggiMathJaxFeatureDef){

  function compile(el, attrs){
    return {
      /** 
       * Note: we need to set up the features in the pre-link so that they'll be ready for wiggi 
       * when it's linking.
       */
      pre: function($scope, $el, $attrs){
        $scope.extraFeatures = {
          definitions: [
            new WiggiMathJaxFeatureDef()
          ]
        };
      }
    };
  }

  var template = [
    '<div>',
    '  <div mini-wiggi-wiz="" features="extraFeatures" ng-model="prompt">',
    '  </div>',
    '</div>'].join('\n');

  return {
    restrict: 'A',
    compile: compile,
    transclude: false,
    template: template,
    replace: false, 
    scope: {
      prompt: '=',
    }
  };
}]);