var link;

link = function ($compile) {
  return function ($scope, $elem, attrs) {
    console.log("config pane....");
    return $scope.$watch(attrs['ngModel'], function (data) {
      var $div, tmpl;
      if (!data) {
        return;
      }
      console.log("[config pane] model loaded.");
      tmpl = "<div class='config-chrome'>\n  <div class='title'>Configure " + data.component.componentType + " :: " + data.id + "</div>\n  <div class='holder'><" + data.component.componentType + " id='" + data.id + "'/></div>\n</div>";
      $div = $(tmpl);
      $elem.html($div);
      return $compile($div)($scope.$new());
    });
  };
};

angular.module('corespring-editor.directives').directive('configPane', [
  '$compile', function ($compile) {
    var def;
    def = {
      link: link($compile),
      restrict: 'E',
      template: "<h1>Config pane..</h1>"
    };
    return def;
  }
]);
