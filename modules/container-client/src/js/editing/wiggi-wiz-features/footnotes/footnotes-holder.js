angular.module('corespring-editing.wiggi-wiz-features.footnotes').directive('footnotesHolder', [
  'LogFactory',
  function(LogFactory) {

    var html;
    var DEFAULT_TEXT = "Footnote";
    var $log = LogFactory.getLogger('footnotes-holder');

    var template = [
      '<div class="component-placeholder" contenteditable="false">',
      '  <div class="blocker">',
      '    <div class="bg"></div>',
      '    <div class="edit-controls">',
      '      <div class="edit-icon-button" tooltip="edit" tooltip-append-to-body="true" tooltip-placement="bottom">',
      '        <i ng-click="editNode($event)" class="fa fa-pencil"></i>',
      '      </div>',
      '      <div class="delete-icon-button" tooltip="delete" tooltip-append-to-body="true" tooltip-placement="bottom">',
      '        <i ng-click="deleteNode($event)" class="fa fa-trash-o"></i>',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <div class="holder"><div footnotes></div></div>',
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

      function removeTooltip(){
        $scope.$broadcast("$destroy");
      }

      $scope.deleteNode = function($event) {
        $event.stopPropagation();
        removeTooltip();
        $scope.$emit('wiggi-wiz.delete-node', $element);
      };

      $scope.editNode = function($event) {
        $event.stopPropagation();
        removeTooltip();
        $scope.$emit('wiggi-wiz.call-feature-method', 'editNode', $element);
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
