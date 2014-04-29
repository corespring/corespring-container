angular.module('corespring-editor.directives').directive('componentWeights', [
  '$log',
  function($log) {

    function link($scope, $element) {}

    function controller($scope) {

    }

    return {
      restrict: 'E',
      link: link,
      replace: true,
      transclude: true,
      controller: controller,
      template: [
        '  <form class="form-horizontal" ng-transclude>',
        '  </form>'
      ].join('\n'),
      scope: {
        component: '=ngModel'
      }
    };
  }
]);


/**
  component-weighter(ng-model="component")
*/

angular.module('corespring-editor.directives').directive('componentWeighter', [
  '$log',
  function($log) {

    function link($scope, $element, $attrs, ComponentWeights) {
      var log = $log.debug.bind($log, '[component-weighter] -');

      log('!', $scope.component);

      $scope.uid = '' + Math.random();

      log('component id: ', $scope.componentId);
      log('component: ', $scope.component);

      log($scope.uid);
    }

    return {
      restrict: 'E',
      link: link,
      replace: true,
      require: '^componentWeights',
      template: [
        '  <div class="form-group">',
        '    <label class="control-label col-sm-7">Question: ({{component.componentType}}) is worth</label>',
        '    <div class="col-sm-3">',
        '      <div class="input-group">',
        '        <input id="{{uid}} type="text" class="form-control" ng-model="component.weight"></input>',
        '        <span class="input-group-addon">points</span>',
        '    </div>',
        '  </div>'
      ].join('\n'),
      scope: {
        component: '=ngModel',
        componentId: '=componentId'
      }
    };
  }
]);