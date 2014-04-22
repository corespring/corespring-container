/* global MathJax */
angular.module('corespring.wiggi-wiz-features').directive('mathjaxHolder', [

  function() {

    var html;

    function compile($element) {
      html = $element.html();
      return link;
    }

    function link($scope, $element) {
      $scope.originalMarkup = html;

      $scope.$watch('originalMarkup', function(n) {
        if (n) {
          $element.html('<span class="mathjax-holder">' + n + '</span>');
          MathJax.Hub.Queue(['Typeset', MathJax.Hub, $element[0]]);
        }
      });
    }

    return {
      restrict: 'E',
      compile: compile
    };
  }
]);