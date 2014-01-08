(function () {
  var link;

  link = function ($compile) {
    return function ($scope, $elem, attrs) {
      var name = attrs.ngModel || 'model.xhtml';
      $scope.$watch(name, function (newXml) {
        console.log(newXml);
        $elem.html($compile(newXml)($scope));
      }, true);
    };
  };

  angular.module('corespring-rig.directives').directive('inlinePreview', [
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