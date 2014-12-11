angular.module('corespring-common.directives')
  .directive('newSummaryFeedback',
  [
  'LogFactory',
  function(LogFactory) {

  var logger = LogFactory.getLogger('new-summary-feedback');

  function link($scope,$element, $attrs){

    $scope.isSummaryFeedbackOpen = false;

    $scope.toggleSummaryFeedbackOpen = function() {
      $scope.isSummaryFeedbackOpen = !$scope.isSummaryFeedbackOpen;
      logger.debug("isSummaryFeedbackOpen", $scope.isSummaryFeedbackOpen);
    };
  }

  return {
    link: link,
    scope : {
      ngModel: '='
    },
    restrict: 'AE',
    replace: true,
    templateUrl : '/common/directives/new-summary-feedback.html'
  };
}]);
