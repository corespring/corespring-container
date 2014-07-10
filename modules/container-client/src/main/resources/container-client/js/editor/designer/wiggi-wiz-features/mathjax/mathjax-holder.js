/* global MathJax */
angular.module('corespring.wiggi-wiz-features.mathjax').directive('mathjaxHolder', ['$log',
  'MathFormatUtils',

  function($log, MathFormatUtils) {

    var template = [
      '<div class="component-placeholder" contenteditable="false">',
      '  <div class="blocker">',
      '     <div class="bg"></div>',
      '     <div class="content"></div>',
      '     <div class="edit-controls">',
      '      <div class="edit-icon-button" tooltip="edit" tooltip-append-to-body="true" tooltip-placement="bottom">',
      '        <i ng-click="editNode($event)" class="fa fa-pencil"></i>',
      '      </div>',
      '      <div class="delete-icon-button" tooltip="delete" tooltip-append-to-body="true" tooltip-placement="bottom">',
      '        <i ng-click="deleteNode($event)" class="fa fa-trash-o"></i>',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <div class="holder"></div>',
      '</div>'
    ].join('\n');

    var log = $log.debug.bind($log, '[mathjax-holder]');
    var html;

    function compile($element) {
      html = $element.html();
      $element.addClass('mathjax-holder');
      $element.html(template);
      return link;
    }

    function link($scope, $element) {
      log(html);
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

      /** Note: because we are not replacing the node - we are updating the class att
       * on a node that isn't in the template.
       */
      function updateClass(newClass) {
        $element.removeClass('block');
        $element.removeClass('inline');
        $element.addClass(newClass);
      }

      function updateDisplayMode(math) {
        if (!math) {
          return;
        }
        var info = MathFormatUtils.getMathInfo(math);
        log('displayType: ', info);
        updateClass(info.displayMode);
      }

      $scope.$watch('originalMarkup', function(n) {
        updateDisplayMode(n);

        if (!n || _.isEmpty(n)) {
          $element.find('.holder').html('Math');
          updateClass('inline');
        } else {
          $element.find('.holder').html(n);
          MathJax.Hub.Queue(['Typeset', MathJax.Hub, $element[0]]);
        }
      });
    }

    return {
      restrict: 'A',
      compile: compile
    };
  }
]);