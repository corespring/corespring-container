(function () {

  var link;

  link = function () {
    return function ($scope, $elem, attrs) {
      $($elem).tooltip({title: attrs.corespringTooltip});
    };
  };

  angular.module('corespring-editor.directives').directive('corespringTooltip', [
    function () {
      var def;
      def = {
        link: link(),
        restrict: 'AE'
      };
      return def;
    }
  ]);

}).call(this);