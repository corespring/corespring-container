angular.module('corespring-singleComponentEditor.directives')
  .directive('lockfix', ['$timeout', '$window', function($timeout, $window){

    function link($scope, $elem, $attrs){
      var initLeft;

      $timeout(function() {
        initLeft = $elem.offset().left;
        $.lockfixed($elem, {});
      }, 100);

      $($window).scroll(function() {
        var x = $elem.parents('.main').scrollLeft();
        $elem.offset({
          left: initLeft-x
        });
      });
    }

    return {
      restrict: 'A',
      link: link
    };
  }]);