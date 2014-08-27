(function() {

  // Caches ids of elements that were previously clean.
  var cleanCache = [];

  /**
   * Returns true if the item by id was previously clean. Has a side effect to remove the id from the clean cache.
   */
  function wasClean(id) {
    var index = cleanCache.indexOf(id);
    if (index >= 0) {
      cleanCache.splice(index, 1);
    }
    return index >= 0;
  }

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

        function renderComponent(id) {
          var data = ComponentRegister.loadedData[id].data;

          /**
           * Only rerender components when they are clean or when they were previously clean.
           */
          function shouldRerender(id) {
            if (data.clean) {
              cleanCache.push(id);
            }
            return data.clean || wasClean(id);
          }

          if (shouldRerender(id)) {
            getComponentById(id).wrap([
              '<placeholder',
              'id="' + id + '"',
              'component-type="' + data.componentType + '"',
              'configurable="false"',
              '>',
              '</placeholder>'
            ].join(' '));
            $compile($element)($scope);
          }

        }

        _(ComponentRegister.components).keys().each(function(id) {
          var comp = getComponentById(id);
          if (parseInt(id, 10) === $rootScope.selectedComponentId) {
            comp.parent().addClass('selected');
          }

        });

        $scope.$on('updatedComponent', function(event, id) {
          renderComponent(id);
        });

      }

      function postLink($scope) {

        function selectContainer(id) {
          $('.player-body .selected').removeClass('selected');
          if (getComponentById(id).parent().prop('tagName') === 'component-container') {
            getComponentById(id).parent().addClass('selected');
            $scope.selectedComponentId = id;
            var phase = $scope.root && $scope.$root.$$phase;
            if (phase && phase !== '$apply' && phase !== '$digest') {
              $scope.$apply();
            }

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
})();