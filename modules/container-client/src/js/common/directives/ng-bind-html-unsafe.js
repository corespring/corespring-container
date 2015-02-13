angular.module('corespring-common.directives').directive('ngBindHtmlUnsafe', ['$sce', 'MathJaxService', function($sce, MathJaxService) {
  return {
    scope: {
      ngBindHtmlUnsafe: '='
    },
    template: "<div ng-bind-html='trustedHtml'></div>",
    link: function($scope, iElm) {
      $scope.updateView = function() {
        $scope.trustedHtml = $sce.trustAsHtml($scope.ngBindHtmlUnsafe);
        MathJaxService.parseDomForMath(1, iElm[0]);
      };

      $scope.$watch('ngBindHtmlUnsafe', function(newVal, oldVal) {
        $scope.updateView();
      });
    }
  };
}]);