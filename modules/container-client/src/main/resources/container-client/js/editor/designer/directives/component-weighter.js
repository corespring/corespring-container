angular.module('corespring-editor.directives').directive('componentWeights', [
  '$log',
  function($log) {

    function link($scope, $element) {}

    function addWeights(acc, comp) {
      return acc + readWeight(comp.weight);
    }

    function readWeight(w) {
      var out = parseInt(w, 10);
      out = isNaN(out) ? 0 : out;
      return out;
    }

    function controller($scope) {
      this.getPercentage = function(weight) {
        var weightNumber = readWeight(weight);
        var total = _.reduce($scope.components, addWeights, 0);
        return Math.floor((weight / total) * 100);
      };

      this.getTitle = function(componentType) {
        var comp = _.find($scope.componentSet, function(c) {
          return c.componentType === componentType;
        });

        if (comp) {
          return comp.title;
        }
      };
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
        components: '=ngModel',
        componentSet: '='
      }
    };
  }
]);


/**
  component-weighter(ng-model="component")
*/

angular.module('corespring-editor.directives').directive('componentWeightInput', [
  '$log',
  function($log) {

    function link($scope, $element, $attrs, ComponentWeights) {
      var log = $log.debug.bind($log, '[component-weighter] -');

      log('!', $scope.component);

      $scope.uid = 'component-weight-input-id-' + $scope.componentId;

      log('component id: ', $scope.componentId);
      log('component: ', $scope.component);

      log($scope.uid);

      $scope.getPercentage = function(weight) {
        return ComponentWeights.getPercentage(weight);
      };

      $scope.getTitle = function(t) {
        return ComponentWeights.getTitle(t);
      };
    }

    return {
      restrict: 'E',
      link: link,
      replace: true,
      require: '^componentWeights',
      template: [
        '  <div class="form-group">',
        '    <label class="control-label col-sm-5" for="{{uid}}">{{getTitle(component.componentType)}} [{{componentId}}] is worth</label>',
        '    <div class="col-sm-3">',
        '      <div class="input-group">',
        '        <input id="{{uid}}" type="text" class="form-control" ng-model="component.weight"></input>',
        '        <span class="input-group-addon">pts</span>',
        '        <span class="input-group-addon" style="width: 52px;">{{getPercentage(component.weight)}}%</span>',
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