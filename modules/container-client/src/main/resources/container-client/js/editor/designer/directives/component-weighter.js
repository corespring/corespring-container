angular.module('corespring-editor.directives').directive('componentWeights', [
  '$log',
  function($log) {

    var log = $log.debug.bind($log, '[component-weights]');

    function link($scope, $element) {

      var compSize = 0;

      function updateSortedComponent() {

        if (!$scope.markup || !$scope.components) {
          return;
        }

        var ids = _.map($($scope.markup).filter('[id]'), function(n) {
          return $(n).attr('id');
        });

        var sorted = _.map(ids, function(id) {
          return {
            id: id,
            component: $scope.components[id]
          };
        });

        $scope.sortedComponents = sorted;

        log($scope.sortedComponents);
      }

      $scope.$watch('markup', function() {
        updateSortedComponent();
      });

      $scope.$watch('components', function() {
        if ($scope.components && _.size($scope.components) !== compSize) {
          updateSortedComponent();
          compSize = _.size($scope.components);
        }
      });

    }

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
      controller: controller,
      template: [
        '  <form class="form-horizontal">',
        //'    <span component-id="compId" component="comp" ng-repeat="(compId,comp) in sortedComponents">{{compId}}</span>',
        '    <component-weight-input component-id="idAndComp.id" ng-model="idAndComp.component" ng-repeat="idAndComp in sortedComponents"/>',
        '  </form>'
      ].join('\n'),
      scope: {
        components: '=ngModel',
        componentSet: '=',
        markup: '='
      }
    };
  }
]);


/**
  component-weighter(ng-model="component")
*/

angular.module('corespring-editor.directives').directive('componentWeightInput', [
  '$log', '$timeout',
  function($log, $timeout) {

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

      $scope.selectComponent = function() {

        $timeout(function() {
          $scope.$emit('componentSelected', {
            id: $scope.componentId
          });
        });
      };
    }

    return {
      restrict: 'E',
      link: link,
      replace: true,
      require: '^componentWeights',
      template: [
        '  <div class="form-group" ng-click="selectComponent()">',
        '    <label class="control-label col-sm-5" for="{{uid}}">{{getTitle(component.componentType)}} is worth</label>',
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