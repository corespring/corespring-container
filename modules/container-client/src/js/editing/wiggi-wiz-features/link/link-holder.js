angular.module('corespring-editing.wiggi-wiz-features.link').directive('linkHolder', ['$log',

  function($log) {

    var template = [
      '<div class="component-placeholder" contenteditable="false">',
      '  <ul class="edit-controls">',
      '    <li class="edit-icon-button" tooltip="edit" tooltip-append-to-body="true" tooltip-placement="bottom">',
      '      <i ng-click="edit($event)" class="fa fa-pencil"></i>',
      '    </li>',
      '    <li class="delete-icon-button" tooltip="unlink" tooltip-append-to-body="true" tooltip-placement="bottom">',
      '      <i ng-click="unlink($event)" class="fa fa-chain-broken"></i>',
      '    </li>',
      '  </ul>',
      '  <div class="holder" ng-click="follow($event)" ng-transclude></div>',
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

      $scope.follow = function($event) {
        $event.stopPropagation();
        $event.preventDefault();
        window.open($('a', $element).attr('href'), '_blank');
        return false;
      };


      function removeTooltip(){
        $scope.$broadcast("$destroy");
      }

      $scope.unlink = function($event) {
        $event.stopPropagation();
        removeTooltip();
        var replacement = $('a', $element).html();
        $scope.$emit('wiggi-wiz.replace-node', $element, $("<span>" + replacement + "</span>"));
      };

      $scope.edit = function($event) {
        $event.stopPropagation();
        removeTooltip();
        $scope.$emit('wiggi-wiz.call-feature-method', 'editNode', $element);
      };

    }

    return {
      restrict: 'A',
      transclude: true,
      compile: compile
    };
  }
]);