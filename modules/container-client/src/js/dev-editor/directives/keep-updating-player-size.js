angular.module('corespring-dev-editor.directives').directive('keepUpdatingPlayerSize', [
  '$timeout',
  function($timeout){
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, elem, attr){
      var lastHeight = 0;
      var delay = 100;
      var activeTimeout;

      updatePlayerSize();
      scope.$on('$destroy', stopUpdatingPlayerSize);

      function updatePlayerSize() {
        var newHeight = elem.height() - 40;
        if (newHeight != lastHeight) {
          lastHeight = newHeight;
          delay = 100;
          elem.find('.preview').height(newHeight);
        }
        activeTimeout = $timeout(updatePlayerSize, delay);
        delay = Math.min( delay + 100, 500);
      }

      function stopUpdatingPlayerSize(){
        $timeout.cancel(activeTimeout);
      }

    }
  }
]);