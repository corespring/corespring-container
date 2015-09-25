angular.module('corespring-editor.directives')
  .directive('supportingMaterialInfo', [
    function() {
      return {
        restrict: 'A',
        scope: {
          ngModel: '='
        },
        require: '^ngModel',
        templateUrl: '/editor/supporting-materials/directives/supporting-material-info.html'
      };     
    }]);