angular.module('corespring-common.directives').directive('summaryFeedback', [
  function() {
    var glyphs = {
      ready: [
        '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"',
        'viewBox="-135 129 16 31" style="enable-background:new -135 129 16 31;" xml:space="preserve">',
        '  <style type="text/css">',
        '    .st0{fill:#D0CAC5;stroke:#E6E3E0;stroke-width:0.75;stroke-miterlimit:10;}',
        '    .st1{fill:#B3ABA4;stroke:#CDC7C2;stroke-width:0.5;stroke-miterlimit:10;}',
        '    .st2{fill:#1A9CFF;}',
        '    .st3{fill:#BCE2FF;}',
        '  </style>',
        '  <path class="st0" d="M-120.7,142.4c0-3.7-3.3-6.6-7.1-5.8c-2.4,0.5-4.3,2.4-4.7,4.8c-0.4,2.3,0.6,4.4,2.2,5.7c0.4,0.3,0.6,0.8,0.6,1.3v1.9h6.1v-1.9c0-0.5,0.2-1,0.6-1.3C-121.6,146-120.7,144.3-120.7,142.4z"/>',
        '  <path class="st0" d="M-124.4,154.3h-4.5c-0.4,0-0.8-0.4-0.8-0.8v-1.6h6.1v1.6C-123.6,153.9-123.9,154.3-124.4,154.3z"/>',
        '  <path class="st1" d="M-121.3,141.8c0-3.7-3.3-6.6-7.1-5.8c-2.4,0.5-4.3,2.4-4.7,4.8c-0.4,2.3,0.6,4.4,2.2,5.7c0.4,0.3,0.6,0.8,0.6,1.3v1.9h6.1v-1.9c0-0.5,0.2-1,0.6-1.3C-122.2,145.3-121.3,143.7-121.3,141.8z"/>',
        '  <path class="st1" d="M-125,153.7h-4.5c-0.4,0-0.8-0.4-0.8-0.8v-1.6h6.1v1.6C-124.2,153.3-124.6,153.7-125,153.7z"/>',
        '  <path class="st2" d="M-122,141.1c0-3.7-3.3-6.6-7.1-5.8c-2.4,0.5-4.3,2.4-4.7,4.8c-0.4,2.3,0.6,4.4,2.2,5.7c0.4,0.3,0.6,0.8,0.6,1.3v1.9h6.1v-1.9c0-0.5,0.2-1,0.6-1.3C-122.8,144.7-122,143-122,141.1z"/>',
        '  <path class="st2" d="M-125.7,153h-4.5c-0.4,0-0.8-0.4-0.8-0.8v-1.6h6.1v1.6C-124.9,152.7-125.2,153-125.7,153z"/>',
        '  <path class="st3" d="M-130.4,142.1c0-2.1,1.7-3.9,3.9-3.9c0.3,0,0.5,0,0.8,0.1c-0.6-0.8-1.5-1.3-2.6-1.3c-1.8,0-3.3,1.5-3.3,3.3c0,1.1,0.5,2,1.3,2.6C-130.4,142.6-130.4,142.4-130.4,142.1z"/>',
        '</svg>'
      ].join(''),
      hide: [
        '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"',
        'viewBox="-135 129 16 32" style="enable-background:new -135 129 16 32;" xml:space="preserve">',
        '  <style type="text/css">',
        '    .st0{fill:#6696AF;}',
        '    .st1{fill:#C8D4DE;}',
        '  </style>',
        '  <path class="st0" d="M-122,141.1c0-3.7-3.3-6.6-7.1-5.8c-2.4,0.5-4.3,2.4-4.7,4.8c-0.4,2.3,0.6,4.4,2.2,5.7c0.4,0.3,0.6,0.8,0.6,1.3v1.9h6.1v-1.9c0-0.5,0.2-1,0.6-1.3C-122.8,144.7-122,143-122,141.1z"/>',
        '  <path class="st0" d="M-125.7,153h-4.5c-0.4,0-0.8-0.4-0.8-0.8v-1.6h6.1v1.6C-124.9,152.7-125.2,153-125.7,153z"/>',
        '  <path class="st1" d="M-130.4,142.1c0-2.1,1.7-3.9,3.9-3.9c0.3,0,0.5,0,0.8,0.1c-0.6-0.8-1.5-1.3-2.6-1.3c-1.8,0-3.3,1.5-3.3,3.3c0,1.1,0.5,2,1.3,2.6C-130.4,142.6-130.4,142.4-130.4,142.1z"/>',
        '</svg>'
      ].join('')
    };

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
        '  <div class="summary-feedback-toggle" ng-click="toggleSummaryFeedbackOpen()">',
        '    <div class="summary-feedback-toggle-icon-holder">',
        '      <div class="summary-feedback-toggle-icon show-state" ng-if="!isSummaryFeedbackOpen">'+glyphs.ready+'</div>',
        '      <div class="summary-feedback-toggle-icon hide-state" ng-if="isSummaryFeedbackOpen">'+glyphs.hide+'</div>',
        '    </div>',
        '    <div class="summary-feedback-toggle-label">Learn More</div>',
        '  </div>',
        '  <div class="summary-feedback-content" ng-bind-html-unsafe="ngModel" ng-if="isSummaryFeedbackOpen"></div>',
        '</div>'
      ].join('\n')
    };
  }
]);
