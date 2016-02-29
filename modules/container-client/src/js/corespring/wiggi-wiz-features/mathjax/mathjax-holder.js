angular.module('corespring.wiggi-wiz-features.mathjax')
.directive('mathjaxHolder', 
  ['$log',
  '$templateCache',
  'MathFormatUtils',
  'MathJaxService',
  'WIGGI_EVENTS',
  function($log, 
    $templateCache, 
    MathFormatUtils, 
    MathJaxService, 
    WIGGI_EVENTS) {

    var log = $log.debug.bind($log, '[mathjax-holder]');
    var html;

    function compile($element) {
      html = $element.html();
      $element.addClass('mathjax-holder');
      var template = $templateCache.get('/editor/question/wiggi-wiz-features/mathjax/mathjax-holder.html');
      $element.html(template);
      return link;
    }

    function link($scope, $element) {
      log(html);
      $scope.originalMarkup = html;

      function removeTooltip(){
        $scope.$broadcast("$destroy");
      }

      $scope.deleteNode = function($event) {
        $event.stopPropagation();
        removeTooltip();
        $scope.$emit(WIGGI_EVENTS.DELETE_NODE, $element);
      };

      $scope.editNode = function($event) {
        $event.stopPropagation();
        removeTooltip();
        $scope.$emit(WIGGI_EVENTS.CALL_FEATURE_METHOD, 'editNode', $element);
      };

      /** Note: because we are not replacing the node - we are updating the class att
       * on a node that isn't in the template.
       */
      function updateClass(newClass) {
        $element.removeClass('block');
        $element.removeClass('inline');
        $element.addClass(newClass);
      }

      function updateDisplayMode(math) {
        if (!math) {
          return;
        }
        var info = MathFormatUtils.getMathInfo(math);
        log('displayType: ', info);
        updateClass(info.displayMode);
      }

      $scope.$watch('originalMarkup', function(n) {
        updateDisplayMode(n);

        if (!n || _.isEmpty(n)) {
          $element.find('.holder').html('Math');
          updateClass('inline');
        } else {
          $element.find('.holder').html(n);
          MathJaxService.parseDomForMath(0, $element[0]);
        }
      });
    }

    return {
      restrict: 'A',
      compile: compile
    };
  }
]);
