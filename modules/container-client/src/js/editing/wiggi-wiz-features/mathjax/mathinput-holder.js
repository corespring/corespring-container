angular.module('corespring-editing.wiggi-wiz-features.mathjax')
  .directive('mathinputHolder',
  ['$log', 'WIGGI_EVENTS',
    function($log, WIGGI_EVENTS) {
      function link($scope, $element, $attrs) {
        if ($attrs.showRemoveButton === 'true') {
          $element.append('<span class="remove-math-button"><i class="fa fa-times"></i></span>');
        }

        $element.find('.remove-math-button').click(function() {
          $scope.$emit(WIGGI_EVENTS.DELETE_NODE, $element);
          return false;
        });

        $element.find('i').tooltip({title: 'delete'});

        function removeTooltip() {
          $scope.$broadcast("$destroy");
        }

        $scope.deleteNode = function($event) {
          $event.stopPropagation();
          removeTooltip();
          $scope.$emit(WIGGI_EVENTS.DELETE_NODE, $element);
        };
      }

      return {
        restrict: 'A',
        link: link
      };
    }
  ]);
