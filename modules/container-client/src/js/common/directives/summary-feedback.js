angular.module('corespring-common.directives').directive('summaryFeedback', [
  function() {
    return {
      link: function($scope) {
        $scope.displaySummaryFeedback = function() {
          return $scope.sessionComplete && !_.isEmpty($scope.ngModel);
        };

        $scope.isSummaryFeedbackOpen = false;
        $scope.toggleSummaryFeedbackOpen = function() {
          $scope.isSummaryFeedbackOpen = !$scope.isSummaryFeedbackOpen;
        };
      },
      scope : {
        ngModel: '=',
        sessionComplete: '='
      },
      restrict: 'AE',
      replace: true,
      templateUrl: "/common/directives/summary-feedback.html"
    };
  }
]);
