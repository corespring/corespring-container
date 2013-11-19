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
              '<div class="holder">',
              '<input type="text" class="title-input" placeholder="Unnamed Component" ng-model="title"></input>',
              '<' + configName + ' id="' + data.id + '"></' + configName + '>',
              //'<span class="btn btn-primary btn-xs" ng-click="save()">Save</span>',
              '</div>',
              '</div>'].join("\n");

      $div = $(tmpl);
      $elem.html($div);

      var newScope = $scope.$new();

      newScope.title = data.component.title;
      newScope.$watch('title', function(newTitle) {
        data.component.title = newTitle;
      });

      return $compile($div)(newScope);


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