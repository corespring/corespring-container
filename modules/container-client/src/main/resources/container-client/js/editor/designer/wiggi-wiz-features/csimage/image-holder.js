angular.module('corespring.wiggi-wiz-features.cs-image').directive('imageHolder', ['$log', 'ImageFeature',

  function($log, ImageFeature) {

    var log = $log.debug.bind($log, '[cs-image-holder]');

    var template = [
      '<div class="component-placeholder image image-holder">',
      '  <div class="blocker">',
      '     <div class="bg"></div>',
      '     <div class="content"></div>',
      '     <div class="delete-icon">',
      '       <i ng-click="delete($event)" class="fa fa-times-circle"></i>',
      '    </div>',
      '  </div>',
      '  <div class="holder">',
      '    <img src="imageSrc" style="imageStyle" />',
      '  </div>',
      '</div>'
    ].join('\n');

    function postLink($scope, $element) {
      $scope.delete = function(ev) {
        $scope.deleteNode($element, ImageFeature);
        ev.stopPropagation();
        ev.preventDefault();
      };
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