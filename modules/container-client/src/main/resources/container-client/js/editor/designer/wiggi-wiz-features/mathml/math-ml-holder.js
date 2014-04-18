/* global MathJax */
angular.module('corespring.wiggi-wiz-features').directive('mathMlHolder', [

  function() {

    function link($scope, $element) {
      $scope.originalMarkup = $element.html();

      $scope.$watch('originalMarkup', function(n) {
        if (n) {
          $element.html(n);
          MathJax.Hub.Queue(['Typeset', MathJax.Hub, $element[0]]);
        }
      });
    }

    return {
      restrict: 'E',
      transclude: true,
      replace: true,
      link: link,
      template: '<span class="math-ml-holder" ng-transclude></span>'
    };
  }
]);