angular.module('corespring-editing.wiggi-wiz-features.cs-image').directive('imageHolder', ['$log', 'ImageFeature',

  function($log, ImageFeature) {

    var log = $log.debug.bind($log, '[cs-image-holder]');

    var template = [
      '<div class="component-placeholder image image-holder">',
      '  <div class="blocker">',
      '    <div class="bg"></div>',
      '    <ul class="edit-controls">',
      '      <li class="delete-icon-button" tooltip="delete" tooltip-append-to-body="true" tooltip-placement="bottom">',
      '        <i ng-click="delete($event)" class="fa fa-trash-o"></i>',
      '      </li>',
      '    </ul>',
      '  </div>',
      '  <div class="holder">',
      '    <img src="imageSrc" style="imageStyle" />',
      '  </div>',
      '</div>'
    ].join('\n');

    function postLink($scope, $element) {
      $scope.delete = function(ev) {
        ev.stopPropagation();
        ev.preventDefault();
        removeTooltip();
        $scope.deleteNode($element, ImageFeature);
      };

      function removeTooltip(){
        $scope.$broadcast('$destroy');
      }
    }

    function compile($element, $attrs) {
      var tmpl = template.replace("imageSrc", $attrs.imageSrc).replace("imageStyle", $attrs.imageStyle);
      $element.html(tmpl);
      return postLink;
    }

    return {
      restrict: 'A',
      compile: compile
    };

  }

]);