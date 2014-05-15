angular.module('corespring.wiggi-wiz-features').directive('imageHolder', ['$log',

  function($log) {

    var template = [
      '<div>a',
      '<div class="component-placeholder image image-holder" ng-click="click()">',
      '  <div class="blocker">',
      '     <div class="bg"></div>',
      '     <div class="content"></div>',
      '     <div class="delete-icon">',
      '      <i ng-click="deleteNode()" class="fa fa-times-circle"></i>',
      '    </div>',
      '  </div>',
      '  <div class="holder"></div>',
      '</div>',
      '</div>'
    ].join('\n');

    var log = $log.debug.bind($log, '[image-holder]');
    var html;

    function compile($element) {
      html = $element.html();
      $element.html(template);
      return link;
    }

    function link($scope, $element) {
      log(html);
      $scope.originalMarkup = html;

      $scope.click = function() {
        $scope.$emit('wiggi-wiz.click-node', $element);
      };

      $scope.deleteNode = function() {
        $scope.$emit('wiggi-wiz.delete-node', $element);
      };

      $scope.$watch('originalMarkup', function(n) {
        if (n) {
          $element.find('.holder').html(n);
        }
      });
    }

    return {
      restrict: 'A',
      compile: compile
    };
  }
]);