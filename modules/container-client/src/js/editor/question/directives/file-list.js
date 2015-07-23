(function () {

  /**
   * select-file = a function that takes a named parameter of 'file'
   */
  "use strict";

  var link = function ($scope, $elem, attrs) {
  };

  angular.module('corespring-editor.directives').directive('fileList', [
    function () {
      var def;
      def = {
        link: link,
        restrict: 'E',
        scope: {
          files: '=ngModel',
          selectFile: '&'
        },
        template: [
          '<div class="file-list">',
          '  <h1>File List!</h1>',
          '  <ul ng-model="files">',
          '    <li class="file"',
          '      ng-click="selectFile({file: f})"',
          '      ng-repeat="f in files">{{f.name}}</li>',
          '  </ul>',
          '</div>'
        ].join('')
      };
      return def;
    }
  ]);
}).call(this);