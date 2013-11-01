(function () {

  "use strict";

  /*
    parameters:
    - open-button css rule for open button (default: open-button)
    - close-button css rule for close button (default: close-button)

  */
  angular.module('corespring-editor.directives').directive('flyOutPanel', [
    '$log', function ($log) {
      var def;

      var template = [
          '<div class="fly-out-panel" ng-class="{true:\'\', false:\'closed\'}[isOpen]">',
          '  <table style="width: 100%"><tr>',
          '  <td>$content</td>',
          '  <td style="width: 20px; vertical-align: top; padding-top: 10px;"><div ng-click="togglePanel()" ng-class="{true:\'close-button\', false:\'open-button\'}[isOpen]"></div></td>',
          '  </tr></table>',
          '</div>'
        ].join('');

      var compile = function(element, attrs){
        var newHtml = template.replace("$content", element.html());
        element.html(newHtml);
        return link;
      };

      var link = function($scope, $elem, $attrs){

        $scope.isOpen = false;

        $scope.togglePanel = function(){
          $scope.isOpen = !$scope.isOpen;
        };
      };

      def = {
        compile: compile,
        restrict: 'E'
      };
      return def;
    }
  ]);
}).call(this);

