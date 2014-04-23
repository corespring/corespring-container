var Placeholder = function($rootScope) {

  function link($scope, $element, $attrs) {
    console.log("Linking Placeholder");

    $scope.selected = false;
    $scope.id = $scope.id || 2;

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
      $scope.$apply();
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
      '<div class="component-placeholder-container" data-component-id="{{id}}" ng-class="{selected: selected == true}">',
      '  <div class="component-placeholder" ng-class="[componentType]">{{label}}',
      '    <div class="delete-icon">',
      '      <i ng-click="deleteNode()" class="fa fa-times-circle"></i>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('\n')
  };
};

angular.module('corespring-editor.directives').directive('placeholder',
  ['$rootScope',
    Placeholder
  ]
);