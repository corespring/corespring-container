(function() {

  // Caches ids of elements that were previously clean.
  var cleanCache = [];

  angular.module('corespring-editor.directives').directive('corespringPreviewPlayer', [
    '$log',
    '$rootScope',
    '$compile',
    'ComponentRegister',
    'CorespringPlayerDefinition',

    function($log, $rootScope, $compile, ComponentRegister, CorespringPlayerDefinition) {

      // TODO: Stop using id attributes for this!
      function getPreviewComponentById(id) {
        return $(_.find($('corespring-preview-player #' + id), function(el) {
          return !$(el).is('span');
        }));
      }

      function preCompile($body) {
        for (var id in ComponentRegister.loadedData) {
          var compData = ComponentRegister.loadedData[id].data;
          if (compData.clean) {
            var comp = $body.find('#' + id);
            if (comp) {
              comp.replaceWith(placeHolderMarkup(id, compData.componentType));
            }
          }
        }
      }

      function placeHolderMarkup(id, componentType) {
        return [
          '<placeholder',
          ' id="' + id + '"',
          ' component-type="' + componentType + '"',
          ' configurable="false"',
          '>',
          '</placeholder>'
        ].join('');
      }

      function afterSetDataAndSession($scope, allComponentsData) {
        var shouldRerender = false;
        for (var id in allComponentsData) {
          var compData = allComponentsData[id].data;
          if (compData.clean) {
            if (!cleanCache[id]) {
              cleanCache[id] = true;
              shouldRerender = true;
            }
          } else if (cleanCache[id]) {
            cleanCache[id] = false;
            shouldRerender = true;
          }
        }
        if (shouldRerender) {
          $scope.$emit("rerender-xhtml");
        }
      }

      function postRender($scope, $element, $compile) {

        _(ComponentRegister.components).keys().each(function(id) {
          var comp = getPreviewComponentById(id);
          if (parseInt(id, 10) === $rootScope.selectedComponentId) {
            comp.parent().addClass('selected');
          }
        });
      }

      function postLink($scope) {

        function selectContainer(id) {
          $('.player-body .selected').removeClass('selected');
          var comp = getPreviewComponentById(id);
          if (comp) {
            comp.parent().addClass('selected');
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
        postRender: postRender,
        afterSetDataAndSession: afterSetDataAndSession,
        preCompile: preCompile
      });
    }
  ]);
})();
