angular.module('corespring-editor.directives').directive('placeholder', function() {

  function link($scope, $element, $attrs) {
    console.log("Linking Placeholder");
    $scope.id = $attrs.id || 2;
  }

  return {
    restrict: 'E',
    replace: true,
    link: link,
    scope: {
      label: '@'
    },
    template: [
      '<div class="component-placeholder">{{label}}',
      '</div>',

    ].join('\n')
  };
});