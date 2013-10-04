var link;

link = function($compile) {
  return function($scope, $elem, attrs) {
    return console.log("Structure View");
  };
};

angular.module('corespring-editor.directives').directive('structureView', [
  '$compile', function($compile) {
    var def;
    def = {
      link: link($compile),
      restrict: 'E',
      template: "<h1>Structure View</h1>\n<ul>\n<li class=\"component-thumbnail \" ng-class=\"{active: selectedComponent.id==id}\" ng-click=\"selectComponent(id)\" ng-repeat=\"(id, component) in model.components\">{{component.componentType}} [{{id}}]</li>\n</ul>"
    };
    return def;
  }
]);


