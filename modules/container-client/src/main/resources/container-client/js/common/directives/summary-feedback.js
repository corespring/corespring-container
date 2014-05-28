angular.module('corespring-common.directives').directive('summaryFeedback', ['$log',
  function($log) {
    return {
      scope : {
        data: "=",
        item: "=",
        session: "=",
        template: "@"
      },
      restrict: 'E',
      replace: true,
      template: [
        '<div class="summary-feedback" ng-show="summaryFeedback && isComplete">',
        '  <a class="show-feedback-button" ng-click="toggleSummaryFeedbackOpen()">',
        '    <i class="fa fa-{{isSummaryFeedbackOpen ? \'minus\' : \'plus\'}}-square-o"></i>',
        '    <span>Click for more feedback</span>',
        '  </a>',
        '  <div class="feedback-text" ng-show="isSummaryFeedbackOpen">',
        '    {{summaryFeedback}}',
        '  </div>',
        '</div>'
      ].join(""),
      link: function($scope, iElm, iAttrs, controller) {

        var log = $log.debug.bind($log, '[summaryFeedback directive from ' + $scope.template + '] - ');

        log("setup");

        $scope.$watch("item.summaryFeedback", function(value){
          log("watch item.summaryFeedback", value);
          $scope.summaryFeedback = value;
        });

        $scope.$watch("data.item.summaryFeedback", function(value){
          log("watch data.item.summaryFeedback", value);
          $scope.summaryFeedback = value;
        });

        $scope.$watch("session.isComplete", function(value){
          log("watch session.isComplete", value);
          $scope.isComplete = value;
        });

        $scope.isSummaryFeedbackOpen = false;

        $scope.toggleSummaryFeedbackOpen = function() {
          $scope.isSummaryFeedbackOpen = !$scope.isSummaryFeedbackOpen;
          log("isSummaryFeedbackOpen", $scope.isSummaryFeedbackOpen);
        };

      }
    };
  }
]);
