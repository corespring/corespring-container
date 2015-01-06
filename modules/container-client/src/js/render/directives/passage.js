angular.module('corespring-player.directives').directive('passage',
  function() {
    return {
      restrict: 'C',
      link: function($scope, $element) {
        var show = $element.attr('show') === 'true';
        if (!show) {
          $element.hide();
        }
      }
    };
  }
);