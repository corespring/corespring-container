angular.module('corespring.wiggi-wiz-features').directive('imageHolder', ['$log',

  function($log) {

    var log = $log.debug.bind($log, '[cs-image-holder]');

    var template = [
      '<div class="component-placeholder image image-holder" ng-click="click()">',
      '  <div class="blocker">',
      '     <div class="bg"></div>',
      '     <div class="content"></div>',
      '     <div class="delete-icon">',
      '      <i ng-click="deleteNode()" class="fa fa-times-circle"></i>',
      '    </div>',
      '  </div>',
      '  <div class="holder">click me!!</div>',
      '</div>'
    ].join('\n');

    var html;

    function compile($element) {
      html = $element.html();
      $element.html(template);
      return link;
    }

    function link($scope, $element) {

      log('$scope', $scope);
      log('$element', $element);

      $scope.originalMarkup = html;

      $scope.click = function() {
        log('> click node');
        //$scope.$emit('wiggi-wiz.click-node', $element);
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