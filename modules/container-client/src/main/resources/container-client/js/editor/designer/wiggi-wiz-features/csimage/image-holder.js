angular.module('corespring.wiggi-wiz-features').directive('imageHolder', ['$log',

  function($log) {

    var log = $log.debug.bind($log, '[cs-image-holder]');

    var template = [
      '<div class="component-placeholder image image-holder" ng-click="click()">',
      '  <div class="blocker">',
      '     <div class="bg"></div>',
      '     <div class="content"></div>',
      '     <div class="delete-icon">',
      '      <i ng-click="deleteNode()" class="fa fa-times-circle"></i>',
      '    </div>',
      '  </div>',
      '  <div class="holder">',
      '  <img src="imageSrc" style="imageStyle"/>',
      '  </div>',
      '</div>'
    ].join('\n');

    var html;


    function compile($element, $attrs) {
      var tmpl = template.replace("imageSrc", $attrs.imageSrc).replace("imageStyle", $attrs.imageStyle);
      $element.html(tmpl);
    }

    return {
      restrict: 'A',
      compile: compile
    };

  }

]);