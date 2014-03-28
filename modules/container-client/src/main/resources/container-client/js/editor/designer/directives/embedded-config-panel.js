(function() {

  var link;

  link = function($compile) {
    return function($scope, $elem, attrs) {
      $scope.$watch('configPanelModel', function(n) {
        if (!n) {
          return;
        }
        $scope.closed = false;
        var newScope = $scope.$new();
        $scope.lastScope = newScope;
        var html = '<' + n.type + '-config id="' + n.id + '"></' + n.type + '-config>';
        $elem.find('.panel').html($compile(html)(newScope));
      });

      $scope.closeConfigPanel = function() {
        $scope.closed = true;
        $scope.lastScope.$destroy();
        $elem.find('.panel').empty();
        if ($scope.closePanel && _.isFunction($scope.closePanel)) {
          $scope.closePanel();
        }
      };
    };
  };

  angular.module('corespring-editor.directives').directive('embeddedConfigPanel', [
    '$compile', function($compile) {
      var def;
      def = {
        link: link($compile),
        restrict: 'AE',
        template: [
          "<div class='embedded-config-panel'>",
          "  <div class='pull-right close-button-container' ng-hide='closed'>",
          "    <a class='close-button' ng-click='closeConfigPanel()'>Close</a>",
          "  </div>",
          "  <div class='panel'></div>",
          "</div>"
        ].join(''),
        scope: {
          configPanelModel: "=",
          closePanel: "&"
        }
      };
      return def;
    }
  ]);

}).call(this);