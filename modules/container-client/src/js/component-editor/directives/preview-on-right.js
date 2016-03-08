angular.module('corespring-singleComponentEditor.directives')
  .directive('previewOnRight', [
    function() {
      return {
        restrict: 'A',
        link: function($scope, $elem, $attrs) {
          var previewWidth = parseInt($attrs.previewWidth || "630");
          $elem.width(previewWidth + 670);
          $scope.showPreview = true;
          $scope.$on('showPreview', function(event, show) {
            $scope.showPreview = show;
          });
        }
      };
    }
  ]
);