angular.module('corespring.wiggi-wiz-features.footnotes').directive('footnotesHolder', [
  'LogFactory',
  function(LogFactory) {

    var html;
    var DEFAULT_TEXT = "Footnote";
    var $log = LogFactory.getLogger('footnotes-holder]');

    var template = [
      '<div class="component-placeholder"',
      ' tooltip-placement="bottom" ',
      ' tooltip-append-to-body="true"',
      ' tooltip="Double Click to Edit">',
      '  <div class="blocker">',
      '     <div class="bg"></div>',
      '     <div class="content"></div>',
      '     <div class="delete-icon">',
      '      <i ng-click="deleteNode()" class="fa fa-times-circle"></i>',
      '    </div>',
      '  </div>',
      '  <div footnotes></div>',
      '</div>'
    ].join('\n');

    function compile($element) {
      $log.debug("compile", $element);
      html = $element.html();
      $element.addClass('footnotes-holder');
      $element.html(template);
      return link;
    }

    function link($scope, $element) {
      $log.debug('link', html);

      $scope.originalMarkup = html;

      $scope.deleteNode = function() {
        $log.debug('deleteNode');
        $scope.$emit('wiggi-wiz.delete-node', $element);
      };

      $scope.$watch('originalMarkup', function(n) {
        $log.debug('$watch originalMarkup', n);
        setFootnotes(_.isEmpty(n) ? DEFAULT_TEXT : n);
      });

      function setFootnotes(text){
        $log.debug('setFootnotes', text);
        $element.find('div[footnotes]').html(text);
      }

    }

    return {
      restrict: 'A',
      compile: compile
    };
  }
]);
