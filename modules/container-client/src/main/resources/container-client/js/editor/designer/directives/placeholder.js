angular.module('corespring-editor.directives').directive('placeholder', function() {

  function link($scope, $element, $attrs) {
    console.log("Linking Placeholder");
    $scope.id = $attrs.id || 2;

    $scope.deleteNode = function() {
      $scope.$emit('wiggi-wiz.delete-node', $element);
    };
  }

  return {
    restrict: 'E',
    replace: true,
    link: link,
    scope: {
      label: '@',
      inline: '@'
    },
    template: [
      '<div class="component-placeholder" ng-class="{inline: inline == \'true\'}">{{label}}',
      ' <div class="delete-icon">',
      '   <i ng-click="deleteNode()"',
      '   class="fa fa-times-circle"></i>',
      ' </div>',
      '</div>',

    ].join('\n')
  };
});