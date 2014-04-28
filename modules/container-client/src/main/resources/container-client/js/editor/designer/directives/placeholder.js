var Placeholder = function($rootScope, $compile) {

  function link($scope, $element, $attrs) {
    console.log("Linking Placeholder");

    $scope.selected = false;

    $scope.$watch('selected', function(n) {
      $scope.selectedClass = n === true ? 'selected' : '';
    });

    function renderPlayerComponent() {

      if (!$scope.id || !$scope.componentType) {
        return;
      }
      $element.find('.holder').html('<' + $scope.componentType + ' id="' + $scope.id + '"></' + $scope.componentType + '>');
      $compile($element.find('.holder'))($scope.$new());
    }

    $scope.$watch('id', renderPlayerComponent);
    $scope.$watch('componentType', renderPlayerComponent);

    $scope.id = $scope.id || 2;


    $scope.safeApply = function() {
      var phase = this.$root.$$phase;
      if (!(phase === '$apply' || phase === '$digest')) {
        this.$apply();
      }
    };

    $scope.deleteNode = function() {
      $scope.$emit('wiggi-wiz.delete-node', $element);
    };

    function isElement(data, fn, elseFn) {
      if (data.id === $scope.id) {
        fn();
      } else if (elseFn) {
        elseFn();
      }
    }

    function setSelected(selected) {
      $scope.selected = selected;
      $scope.safeApply();
    }

    $rootScope.$on('componentSelectionToggled', function(event, data) {
      isElement(data, function() {
        setSelected(!$scope.selected);
      }, function() {
        setSelected(false);
      });
    });

    $rootScope.$on('componentSelected', function(event, data) {
      isElement(data, function() {
        setSelected(true);
      });
    });

    $rootScope.$on('componentDeselected', function(event, data) {
      setSelected(false);
    });

  }

  return {
    restrict: 'E',
    replace: true,
    link: link,
    scope: {
      label: '@',
      componentType: '@',
      id: '@'
    },
    template: [
      '<div class="component-placeholder"',
      ' ng-class="[componentType,selectedClass]" ',
      '  data-component-id="{{id}}">',
      '  <div class="blocker">',
      '     <div class="title">Double Click to Edit</div>',
      '     <div class="delete-icon">',
      '      <i ng-click="deleteNode()" class="fa fa-times-circle"></i>',
      '    </div>',
      '  </div>',
      '  <div class="holder"></div>',
      '</div>'
    ].join('\n')
  };
};

angular.module('corespring-editor.directives').directive('placeholder', ['$rootScope', '$compile',
  Placeholder

]);