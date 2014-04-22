/* global MathJax */
angular.module('corespring.wiggi-wiz-features').directive('mathjaxDialog', [

  function() {
    function link($scope, $element) {
      $scope.$watch('data.markup', function(n) {

        if (n) {
          $element.find('.math-preview').html(n);
          MathJax.Hub.Queue(['Typeset', MathJax.Hub, $element.find('.math-preview')[0]]);
        }
      });
    }
    return {
      restrict: 'E',
      link: link,
      replace: true,
      template: [
        '<div class="mathjax-dialog-root">',
        '<div class="editor">',
        ' <textarea ng-model="data.markup"></textarea>',
        '</div>',
        '<div class="math-preview">',
        '</div>',
        '</div>'
      ].join('\n')
    };
  }
]);