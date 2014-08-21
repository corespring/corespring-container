angular.module('corespring-editor.directives').directive('componentContainer', [

  function() {

    function link($scope) {
      console.log('linking the container...');
    }

    return {
      link: link,
      restrict: 'E',
      transclude: true,
      scope: true,
      template: [
        '<img src=""/>',
        '<div class="component-body" ng-transclude/>'
      ].join('')
    };
  }

]);