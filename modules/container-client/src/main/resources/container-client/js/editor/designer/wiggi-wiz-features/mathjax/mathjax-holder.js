/* global MathJax */
angular.module('corespring.wiggi-wiz-features').directive('mathjaxHolder', ['$log',

  function($log) {

    var log = $log.debug.bind($log, '[mathjax-holder]');
    var html;

    function compile($element) {
      html = $element.html();
      $element.addClass('mathjax-holder');
      return link;
    }

    function link($scope, $element) {
      log(html);
      $scope.originalMarkup = html;

      $scope.$watch('originalMarkup', function(n) {
        if (n) {
          $element.html(n);
          MathJax.Hub.Queue(['Typeset', MathJax.Hub, $element[0]]);
        }
      });
    }

    return {
      restrict: 'A',
      compile: compile
    };
  }
]);