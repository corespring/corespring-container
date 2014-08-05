angular.module('corespring.wiggi-wiz-features.link').directive('linkHolder', ['$log',

  function($log) {

    var template = [
      '<div class="component-placeholder">',
      '  <div class="blocker">',
      '     <div class="bg"></div>',
      '     <ul class="edit-controls">',
      '       <li class="edit-icon-button" tooltip="edit" tooltip-append-to-body="true" tooltip-placement="bottom">',
      '         <i ng-click="editNode($event)" class="fa fa-pencil"></i>',
      '       </li>',
      '       <li class="delete-icon-button" tooltip="delete" tooltip-append-to-body="true" tooltip-placement="bottom">',
      '         <i ng-click="deleteNode($event)" class="fa fa-trash-o"></i>',
      '       </li>',
      '     </ul>',
      '  </div>',
      '  <div class="holder" ng-transclude></div>',
      '</div>'
    ].join('\n');

    var log = $log.debug.bind($log, '[link-holder]');
    var html;

    function compile($element) {
      html = $element.html();
      $element.addClass('link-holder');
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
        $scope.$emit('wiggi-wiz.call-feature-method', 'editNode', $element)
      };

    }

    return {
      restrict: 'A',
      transclude: true,
      compile: compile
    };
  }
]);