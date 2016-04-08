angular.module('corespring-editor.directives')
.service('ComponentWeightUtils', [function(){


  function ComponentWeightUtils(){

    function addWeights(acc, comp) {
      return acc + readWeight(comp.weight);
    }

    function readWeight(w) {
      var out = parseInt(w, 10);
      out = isNaN(out) ? 0 : out;
      return out;
    }

    this.getPercentage = function(components, weight) {
      var weightNumber = readWeight(weight);
      var total = _.reduce(components, addWeights, 0);
      var rawPercent = total === 0 ? 0 : (weight / total);
      console.log(rawPercent);
      var multiplied = Math.floor(rawPercent * 10000);
      var normalized = multiplied / 100;
      var out = +(normalized || 0).toFixed(2);
      return out; 
    };
  }

  return new ComponentWeightUtils();

}])
.directive('componentWeights', [
  '$log', 'ComponentWeightUtils',
  function($log, ComponentWeightUtils) {

    var log = $log.debug.bind($log, '[component-weights]');

    function link($scope, $element) {

      var compSize = _.size($scope.components);

      function updateSortedComponent() {

        if (!$scope.markup || !$scope.components) {
          return;
        }

        //Wrap either find or filter - odd inconsistency across platforms here - need to find out why.
        var nodesOnly = (function() {
          var $markup = $('<div>').html($scope.markup);
          return $markup.find('[id]').size() > 0 ? $markup.find('[id]') : $markup.filter('[id]');
        })();

        function interactionsOnly(n) {
          var attributes = _.map(_.pluck(n.attributes, 'name').concat(n.tagName), function(s) {
            return s.toLowerCase();
          });

          return _.find(attributes, function(attribute) {
            return _.contains($scope.componentSetTypes, attribute);
          }) !== undefined;
        }

        function weightableOnly(n) {
          return !!n.component.isScoreable;
        }

        function getId(n) {
          return $(n).attr('id');
        }

        function toIdAndComp(id) {
          return {
            id: id,
            component: $scope.components[id]
          };
        }

        var sorted = _(nodesOnly)
        .filter(interactionsOnly)
        .map(getId)
        .map(toIdAndComp)
        .filter(weightableOnly)
        .value();

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

      $scope.$watch('componentSet', function() {
        $scope.componentSetTypes = _.pluck($scope.componentSet, 'componentType');
        updateSortedComponent();
      });
    }


    function controller($scope) {
      this.getPercentage = function(weight) {
        return ComponentWeightUtils.getPercentage( _.pluck($scope.sortedComponents, 'component'), weight);
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
      restrict: 'EA',
      link: link,

      replace: true,
      controller: ['$scope', controller],
      template: [
      '  <div> ',
      '    <component-weight-input ng-disabled="disabled" component-id="idAndComp.id" ng-model="idAndComp.component" ng-repeat="idAndComp in sortedComponents"/>',
      '  </div>'
      ].join('\n'),
      scope: {
        components: '=ngModel',
        componentSet: '=',
        markup: '=',
        disabled: '@ngDisabled'
      }
    };
  }
  ]);


angular.module('corespring-editor.directives').directive('numberValidation', ['$log',

  function($log) {
    var onlyNumbers = /^\d+$/;

    var log = $log.debug.bind($log, '[number-validation] -');

    return {
      require: 'ngModel',
      link: function(scope, element, attrs, modelCtrl) {

        modelCtrl.$formatters.push(function(modelValue) {
          if (onlyNumbers.test(modelValue)) {
            return modelValue;
          } else {
            return 0;
          }
        });
        modelCtrl.$parsers.push(function(viewValue) {
          if (viewValue === '') {
            modelCtrl.$setValidity('number', true);
            return 0;
          } else if (onlyNumbers.test(viewValue)) {
            modelCtrl.$setValidity('number', true);
            return Math.max(0, parseInt(viewValue, 10));
          } else {
            modelCtrl.$setValidity('number', false);
            return undefined;
          }
        });
      }
    };
  }
  ]);

angular.module('corespring-editor.directives').directive('componentWeightInput', [
  '$log', '$timeout',
  function($log, $timeout) {

    function link($scope, $element, $attrs, ComponentWeights) {

      var log = $log.debug.bind($log, '[component-weighter] -');

      $scope.uid = 'component-weight-input-id-' + $scope.componentId;

      $scope.getPercentage = function(weight) {

        if (weight < 0) {
          return 0;
        }
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
      templateUrl: '/editor/question/directives/component-weighter.html',
      scope: {
        component: '=ngModel',
        componentId: '=componentId',
        disabled: '=ngDisabled'
      }
    };
  }
  ]);