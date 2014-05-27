angular.module('corespring-common.directives').directive('summaryFeedback', ['$log',
  function($log) {
    return {
      restrict: 'E',
      replace: true,
      template: [
        '<div class="summary-feedback" ng-show="data.item.summaryFeedback && session.isComplete">',
        '  <a class="show-feedback-button" ng-click="toggleSummaryFeedbackOpen()">',
        '    <i class="fa fa-{{isSummaryFeedbackOpen ? \'minus\' : \'plus\'}}-square-o"></i>',
        '    <span>Click for more feedback</span>',
        '  </a>',
        '  <div class="feedback-text" ng-show="isSummaryFeedbackOpen">',
        '    {{data.item.summaryFeedback}}',
        '  </div>',
        '</div>'
      ].join(""),
      link: function($scope, iElm, iAttrs, controller) {

        var log = $log.debug.bind($log, '[summaryFeedback directive] - ');

        $scope.isSummaryFeedbackOpen = false;

        $scope.toggleSummaryFeedbackOpen = function() {
          $scope.isSummaryFeedbackOpen = !$scope.isSummaryFeedbackOpen;
          log("isSummaryFeedbackOpen", $scope.isSummaryFeedbackOpen);
        };

      }
    };
  }
]);
