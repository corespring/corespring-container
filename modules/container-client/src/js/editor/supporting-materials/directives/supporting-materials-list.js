 angular.module('corespring-editor.directives')
    .directive('supportingMaterialsList', [function(){

      function link($scope, $element, $attrs){

      }

      return {
        restrict: 'A',
        scope: {
          ngModel: '=',
        },
        link: link,
        templateUrl: '/editor/supporting-materials/directives/supporting-materials-list.html'
      };
    }
  ]);
