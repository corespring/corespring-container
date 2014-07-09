var Placeholder = function(
  $rootScope,
  $compile,
  $log,
  ComponentRegister,
  ComponentConfig) {

  var log = $log.debug.bind($log, '[placeholder]');

  function link($scope, $element, $attrs) {

    $scope.title = '';
    $scope.componentPreview = null;

    function preprocess(component) {
      var serverLogic = corespring.server.logic(component.data.componentType);
      if (_.isFunction(serverLogic.preprocess)) {
        component.data = serverLogic.preprocess(component.data);
      }
      return component;
    }

    function setDataToComponent() {
      var component = $scope.register.loadedData[$scope.id];
      if (component && $scope.componentPreview) {
        $scope.componentPreview.setDataAndSession(preprocess(component));
      }
    }

    $scope.$on('registerComponent', function(event, id, component) {

      $scope.componentPreview = component;
      log('registerComponent', component, id);

      setDataToComponent();
    });

    $scope.register = ComponentRegister;

    $scope.$watch('register.loadedData', function() {
      log('data has changed!');
      setDataToComponent();
    });

    $scope.selected = false;

    $scope.$watch('selected', function(n) {
      $scope.selectedClass = n === true ? 'selected' : '';
    });

    function renderPlayerComponent() {
      if (!$scope.id || !$scope.componentType) {
        return;
      }
      var $holder = $element.find('.holder');
      if (!$holder) {
        return;
      }
      $holder.html('<' + $scope.componentType + ' id="' + $scope.id + '"></' + $scope.componentType + '>');
      $compile($holder)($scope.$new());
    }

    $scope.$watch('id', renderPlayerComponent);
    $scope.$watch('componentType', renderPlayerComponent);

    $scope.id = $scope.id || 2;
    setDataToComponent();

    $scope.safeApply = function() {
      var phase = this.$root.$$phase;
      if (phase !== '$apply' && phase !== '$digest') {
        this.$apply();
      }
    };

    function removeTooltip(){
      $scope.$broadcast("$destroy");
    }

    $scope.deleteNode = function($event) {
      $event.stopPropagation();
      removeTooltip();
      $scope.$emit('wiggi-wiz.delete-node', $element);
    };

    $scope.editNode = function($event) {
      $event.stopPropagation();
      removeTooltip();
      $scope.$emit('wiggi-wiz.call-feature-method', 'editNode', $element);
    };

    function isElement(data) {
      return data.id === $scope.id;
    }

    function setSelected(selected) {
      $scope.selected = selected;
      $scope.safeApply();
    }

    $rootScope.$on('componentSelectionToggled', function(event, data) {
      if (isElement(data)) {
        setSelected(!$scope.selected);
      } else {
        setSelected(false);
      }
    });

    $rootScope.$on('componentSelected', function(event, data) {
      if (isElement(data)) {
        setSelected(true);
      }
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
      '<div class="component-placeholder" ng-class="[componentType,selectedClass]" data-component-id="{{id}}">',
      '  <div class="blocker">',
      '    <div class="bg"></div>',
      '    <div class="content">',
      '      <div class="title"><span ng-show="mainMsg">{{title}}</span></div>',
      '    </div>',
      '    <div class="edit-controls">',
      '      <div class="delete-icon-button" tooltip="delete" tooltip-append-to-body="true" tooltip-placement="bottom">',
      '        <i ng-click="deleteNode($event)" class="fa fa-trash-o"></i>',
      '      </div>',
      '      <div class="edit-icon-button" tooltip="edit" tooltip-append-to-body="true" tooltip-placement="bottom">',
      '        <i ng-click="editNode($event)" class="fa fa-pencil"></i>',
      '      </div>',
      '    </div>',
      '  </div>',
      '  <div class="holder"></div>',
      '</div>'
    ].join('\n')
  };
};

angular.module('corespring-editor.directives')
  .directive('placeholder', [
    '$rootScope',
    '$compile',
    '$log',
    'ComponentRegister',
    'ComponentConfig',
    Placeholder
  ]);