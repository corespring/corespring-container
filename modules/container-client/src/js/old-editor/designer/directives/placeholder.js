var Placeholder = function(
  $rootScope,
  $compile,
  $log,
  ComponentRegister,
  ComponentConfig) {

  var log = $log.debug.bind($log, '[placeholder]');

  function link($scope, $element, $attrs) {

    $scope.configurable = $scope.canConfig !== 'false';
    $scope.title = '';
    $scope.componentPreview = null;
    $scope.register = ComponentRegister;
    $scope.selected = false;

    $scope.safeApply = function() {
      var phase = this.$root.$$phase;
      if (phase !== '$apply' && phase !== '$digest') {
        this.$apply();
      }
    };

    function isElement(data) {
      return data.id === $scope.id;
    }

    function setSelected(selected) {
      $scope.selected = selected;
      $scope.safeApply();
    }

    function removeTooltip(){
      $scope.$broadcast("$destroy");
    }

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

    function markDirty(){
      var component = $scope.register.loadedData[$scope.id];
      if (component && component.data && component.data.clean && $scope.componentPreview) {
        delete component.data.clean;
        log("markDirty ", $scope.componentPreview);
        $scope.componentPreview.setDataAndSession(component);
      }
    }

    function renderPlayerComponent() {
      if (!$scope.id || !$scope.componentType) {
        return;
      }

      var $holder = $element.find('.holder');
      if (!$holder) {
        return;
      }

      var component = $scope.register.loadedData[$scope.id];
      var config = ComponentConfig.get($scope.componentType);

      log("renderPlayerComponent", $holder, component);

      $scope.showIcon = (config.icon !== undefined) && (component.data.clean === true);
      $scope.icon = config.icon;
      $scope.name = config.title;

      if ($scope.showIcon) {
        $holder.html('<span class="title">' + $scope.name + '</span>');
        $holder.css('background-image', 'url('+ $scope.icon + ')');
      } else {
        $holder.css('background-image', 'none');
        $holder.html('<' + $scope.componentType + ' id="' + $scope.id + '"></' + $scope.componentType + '>');
        $compile($holder)($scope.$new());
      }
    }

    $scope.$watch('register.loadedData', function() {
      log('data has changed!');
      setDataToComponent();
    });

    $scope.$watch('selected', function(n) {
      $scope.selectedClass = n === true ? 'selected' : '';
    });

    $scope.$watch('id', renderPlayerComponent);
    $scope.$watch('componentType', renderPlayerComponent);

    $scope.deleteNode = function($event) {
      $event.stopPropagation();
      removeTooltip();
      $scope.$emit('wiggi-wiz.delete-node', $element);
    };

    $scope.editNode = function($event) {
      markDirty();
      $event.stopPropagation();
      removeTooltip();
      $scope.$emit('wiggi-wiz.call-feature-method', 'editNode', $element);
    };

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

    $scope.$on('registerComponent', function(event, id, component) {

      $scope.componentPreview = component;
      log('registerComponent', component, id);

      setDataToComponent();
    });

    // When the item changes, re-render the player component
    $scope.$emit('registerComponent', $scope.id, {
      setDataAndSession: renderPlayerComponent
    });

    //do we need to do that?
    //$scope.id = $scope.id || 2;
    //setDataToComponent();

  }

  return {
    restrict: 'E',
    replace: true,
    link: link,
    scope: {
      label: '@',
      componentType: '@',
      id: '@',
      canConfig: '@configurable'
    },
    template: [
      '<div class="component-placeholder" ng-class="{\'show-icon\': showIcon}" data-component-id="{{id}}">',
      '  <div ng-if="configurable" class="blocker">',
      '    <div class="bg"></div>',
      '    <div class="content"></div>',
      '    <ul class="edit-controls">',
      '      <li class="edit-icon-button" tooltip="edit" tooltip-append-to-body="true" tooltip-placement="bottom">',
      '        <i ng-click="editNode($event)" class="fa fa-pencil"></i>',
      '      </li>',
      '      <li class="delete-icon-button" tooltip="delete" tooltip-append-to-body="true" tooltip-placement="bottom">',
      '        <i ng-click="deleteNode($event)" class="fa fa-trash-o"></i>',
      '      </li>',
      '    </ul>',
      '  </div>',
      '  <div class="holder"></div>',
      '</div>'
    ].join('\n')
  };
};

angular.module('corespring-v1-editor.directives')
  .directive('placeholder', [
    '$rootScope',
    '$compile',
    '$log',
    'ComponentRegister',
    'ComponentConfig',
    Placeholder
  ]);