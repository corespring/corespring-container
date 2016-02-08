(function() {
  /**
   * Non optimized preview player for the editor
   */
  angular.module('corespring-editor.directives')
    .directive('previewPlayer', ['$log', 'ComponentRegister', 'ComponentData',
      function($log, ComponentRegister, ComponentData) {

        var linkFn = function($scope) {

          var rendered = {};

          $scope.playerMode = 'gather';

          $scope.playerSettings = {
            maxNoOfAttempts: 1,
            highlightUserResponse: true,
            highlightCorrectResponse: true,
            showFeedback: true,
            allowEmptyResponses: false
          };

          $scope.responses = {};
          ComponentRegister.setEditable(true);

          var debouncedUpdateComponents = debounce(updateRenderedComponents);

          function debounce(fn) {
            return _.debounce(function() {
              fn();
              $scope.$digest();
            }, 200, {leading: false, trailing: true});
          }

          function updateRenderedComponents() {

            if (!$scope.components) {
              return;
            }

            if (_.isEqual($scope.components, rendered.components)) {
              return;
            }

            _.forIn($scope.components, function(model, id) {
              if (_.isEqual(model, rendered.components ? rendered.components[id] : null)) {
              } else {
                ComponentData.updateComponent(id, model);
              }
            });

            rendered.components = _.cloneDeep($scope.components);
          }

          $scope.$watch('components', function(c, prev) {
            // if (!c || !prev) {
            //   return;
            // }

            debouncedUpdateComponents();
          }, true);


          var xhtmlChange = function(c, prev) {
            $scope.slowXhtml = c;
          };

          $scope.$watch('xhtml', _.debounce(xhtmlChange, 200, {leading: false, trailing: true}));

        };

        return {
          restrict: 'AE',
          scope: {
            components: '=playerComponents',
            xhtml: '=playerMarkup',
            item: '=playerItem',
            mode: '=playerMode'
          },
          link: linkFn,
          template: [
            '<div>',
            '  <corespring-player',
            '    player-mode="{{mode}}"',
            '    player-markup="slowXhtml"',
            '    player-item="item"',
            '    player-outcomes="outcome"',
            '    player-session="itemSession"></corespring-player>',
            '</div>'
          ].join("\n")
        };
      }
    ]);


}).call(this);
