(function () {
  var link;

  link = function ($compile) {
    return function ($scope, $elem, attrs) {
      $scope.$watch('model.xhtml', function (newXml) {
        console.log(newXml);
        $elem.html($compile(newXml)($scope));
      });
    };
  };

  angular.module('corespring-editor.directives').directive('inlinePreview', [
    '$compile', function ($compile) {
      var def;
      def = {
        link: link($compile),
        restrict: 'AE'
      };
      return def;
    }
  ]);

}).call(this);