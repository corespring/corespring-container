angular.module('corespring-editor.directives').directive('corespringPreviewPlayer', [
  '$log',
  '$rootScope',
  '$compile',
  'ComponentRegister',
  'CorespringPlayerDefinition',
  function($log, $rootScope, $compile, ComponentRegister, CorespringPlayerDefinition) {
    // TODO: Stop using id attributes for this!
    function getComponentById(id) {
      return $(_.find($('corespring-preview-player #' + id), function(el) {
        return !$(el).is('span');
      }));
    }

    function postRender($scope, $element) {
      _(ComponentRegister.components).keys().each(function(id) {
        var comp = getComponentById(id);
        if (parseInt(id, 10) === $rootScope.selectedComponentId) {
          comp.parent().addClass('selected');
        }
        getComponentById(id).wrap('<component-container class="component-container"></component-container>');
        $compile($(getComponentById(id)).parent())($scope);
      });
    }

    function postLink($scope) {

      function selectContainer(id) {
        $('.player-body .selected').removeClass('selected');
        if (getComponentById(id).parent().prop('tagName') === 'component-container') {
          getComponentById(id).parent().addClass('selected');
          $scope.selectedComponentId = id;
          $scope.$apply();

          if ($('component-container.selected').size() > 0) {
            var target = $('component-container.selected')[0];
            target.scrollIntoView();
          }
        } else {
          $log.error('Could not find component-container for id = ' + id);
        }
      }

      function deselectContainer() {
        $('.player-body .selected').removeClass('selected');
        $scope.selectedComponentId = undefined;
      }

      $rootScope.$on('componentSelectionToggled', function(event, data) {
        var phase = $scope.$$phase;

        if ($scope.selectedComponentId === data.id) {
          deselectContainer();
        } else {
          selectContainer(data.id);
        }

        if (phase !== '$apply' && phase !== '$digest') {
          $scope.$apply();
        }
      });

      $rootScope.$on('componentSelected', function(event, data) {
        selectContainer(data.id);
      });

      $rootScope.$on('componentDeselected', function() {
        deselectContainer();
      });

    }

    return new CorespringPlayerDefinition({
      mode: 'editor',
      postLink: postLink,
      postRender: postRender
    });
  }
]);