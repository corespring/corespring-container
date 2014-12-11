angular.module('corespring-common.directives')
  .directive('summaryFeedback',
  [ function() {

    function link($scope,$element, $attrs){

      console.log($scope.ngModel);

      $scope.isSummaryFeedbackOpen = false;
      $scope.toggleSummaryFeedbackOpen = function() {
        $scope.isSummaryFeedbackOpen = !$scope.isSummaryFeedbackOpen;
      };
    }

  return {
    link: link,
    scope : {
      ngModel: '='
    },
    restrict: 'AE',
    replace: true,
    templateUrl : '/common/directives/summary-feedback.html'
  };
}]);
