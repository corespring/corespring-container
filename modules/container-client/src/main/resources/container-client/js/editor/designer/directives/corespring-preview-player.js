angular.module('corespring-editor.directives').directive('corespringPreviewPlayer', [
  '$log',
  '$rootScope',
  'ComponentRegister',
  'CorespringPlayerDefinition',
  function($log, $rootScope, ComponentRegister, CorespringPlayerDefinition) {
    // TODO: Stop using id attributes for this!
    function getComponentById(id) {
      return $(_.find($('corespring-preview-player #' + id), function(el) {
        return !$(el).is('span');
      }));
    }

    function postRender() {
      _(ComponentRegister.components).keys().each(function(id) {
        var comp = getComponentById(id);
        if (parseInt(id, 10) === $rootScope.selectedComponentId) {
          comp.addClass('selected');
        }
        getComponentById(id).addClass('component-container');
      });
    }

    function postLink($scope) {

      function selectContainer(id) {
        $('.player-body .selected').removeClass('selected');
        if (getComponentById(id).hasClass('component-container')) {
          getComponentById(id).addClass('selected');
          $scope.selectedComponentId = id;
          var phase = $scope.root && $scope.$root.$$phase;
          if (phase && phase !== '$apply' && phase !== '$digest') {
            $scope.$apply();
          }

          if ($('.component-container.selected').size() > 0) {
            var target = $('.component-container.selected')[0];
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