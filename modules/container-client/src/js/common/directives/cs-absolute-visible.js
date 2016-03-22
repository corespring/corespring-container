angular.module('corespring-common.directives').directive('csAbsoluteVisible', ['$sce', function($sce) {
  return {
    link: function($scope, $elem, $attrs) {
      $scope.$watch($attrs.csAbsoluteVisible, function(v) {
        $elem.css('visibility', v ? '' : 'hidden');
        $elem.css('position', v ? '' : 'absolute');
      });
    }
  };
}]);