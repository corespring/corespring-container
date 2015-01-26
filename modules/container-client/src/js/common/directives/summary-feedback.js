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
      template : [
        '<div class="summary-feedback" ng-show="displaySummaryFeedback()">',
        '  <div class="panel summary-feedback-panel-preview">',
        '    <div class="panel-heading show-feedback-button" ng-click="toggleSummaryFeedbackOpen()">',
        '      <h4 class="panel-title">',
        '        <i class="fa fa-lightbulb-o"></i>',
        '        &nbsp;Learn More',
        '      </h4>',
        '    </div>',
        '    <div class="panel-body feedback-text" ng-show="isSummaryFeedbackOpen"',
        '        ng-bind-html-unsafe="item.summaryFeedback">',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n')
    };
  }
]);
