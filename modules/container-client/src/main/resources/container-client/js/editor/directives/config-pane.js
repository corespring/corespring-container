(function() {

var link;

link = function ($compile) {
  return function ($scope, $elem, attrs) {
    console.log("config pane....");
    $scope.$watch(attrs.ngModel, function (data) {
      var $div, tmpl;
      if (!data) {
        return;
      }
      var configName = data.component.componentType + '-config';
      console.log("[config pane] model loaded.");
      tmpl = ['<div class="config-chrome">',
              '<div class="title">Configure ' + data.component.componentType + ' :: ' + data.id + '</div>',
              '<div class="holder">',
              '<' + configName + ' id="' + data.id + '"></' + configName + '>',
              '</div>',
              '</div>'].join("\n");

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

}).call(this);