angular.module('corespring.wiggi-wiz-features.footnotes').directive('footnotesDialog', [
  'LogFactory',
  function(LogFactory) {

    var $log = LogFactory.getLogger('footnotes-dialog');

    var template = [
      '<div class="footnotes-dialog-root">',
      '  <div class="fn-header">',
      '    <div class="fn-dialog-title">Enter Footnote below</div>',
      '  </div>',
      '  <textarea class="fn-textarea" ng-model="footnotesContent" placeholder="Enter footnote here..."></textarea>',
      '</div>'
    ].join('\n');


    function link($scope, $element, $attrs) {
      $log.debug(link);
    }

    return {
      scope : {
        footnotesContent : '=ngModel'
      },
      restrict: 'E',
      link: link,
      replace: true,
      template: template
    };
  }
]);
