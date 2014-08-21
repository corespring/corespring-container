angular.module('corespring-editor.directives').directive('componentContainer', [

  function() {

    function link($scope) {
      console.log('linking the container...', $scope);
    }

    return {
      link: link,
      restrict: 'E',
      transclude: true,
      template: [
        '<img src=""/>',
        '<div class="component-body" ng-transclude />'
      ].join('')
    };
  }

]);