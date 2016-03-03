angular.module('corespring-singleComponentEditor.directives')
  .directive('lockfix', ['$timeout', function($timeout){

    function link($scope, $elem, $attrs){
      $timeout(function() {
        $.lockfixed($elem, {});
      }, 100);
    }

    return {
      restrict: 'A',
      link: link
    };
  }]);