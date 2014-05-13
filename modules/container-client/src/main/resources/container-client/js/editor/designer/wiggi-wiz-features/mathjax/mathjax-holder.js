/* global MathJax */
angular.module('corespring.wiggi-wiz-features').directive('mathjaxHolder', ['$log',

  function($log) {

    var template = [
      '<div class="component-placeholder"',
      ' tooltip-placement="bottom" ',
      ' tooltip-append-to-body="true"',
      ' tooltip="Double Click to Edit">',
      '  <div class="blocker">',
      '     <div class="bg"></div>',
      '     <div class="content"></div>',
      '     <div class="delete-icon">',
      '      <i ng-click="deleteNode()" class="fa fa-times-circle"></i>',
      '    </div>',
      '  </div>',
      '  <div class="holder"></div>',
      '</div>'
    ].join('\n');

    var log = $log.debug.bind($log, '[mathjax-holder]');
    var html;

    function compile($element) {
      html = $element.html();
      $element.addClass('mathjax-holder');
      $element.html(template);
      return link;
    }

    function link($scope, $element) {
      log(html);
      $scope.originalMarkup = html;

      $scope.deleteNode = function() {
        $scope.$emit('wiggi-wiz.delete-node', $element);
      };

      $scope.$watch('originalMarkup', function(n) {
        if (n) {
          $element.find('.holder').html(n);
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