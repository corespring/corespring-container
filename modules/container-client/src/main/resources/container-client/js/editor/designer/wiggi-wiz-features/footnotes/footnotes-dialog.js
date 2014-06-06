angular.module('corespring.wiggi-wiz-features.footnotes').directive('footnotesDialog', [
  'LogFactory',
  function(LogFactory) {

    var $log = LogFactory.getLogger('footnotes-dialog');

    var template = [
      '<div class="footnotes-dialog-root">',
      '  <div class="header">',
      '    <div class="fn-dialog-title">Enter Footnotes below</div>',
      '  </div>',
      '  <textarea class="fn-textarea" ng-model="footnotesContent" placeholder="Enter footnotes here..."></textarea>',
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
