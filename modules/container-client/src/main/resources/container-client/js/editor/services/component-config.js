angular.module('corespring-editor.services')
  .service('ComponentConfig', [
    'DesignerService',
    function(DesignerService) {

      var componentSet;

      function onLoaded(components) {
        componentSet = components.interactions;
      }

      DesignerService.loadAvailableUiComponents(onLoaded);

      function Definition() {
        this.showTooltip = function(componentType) {

          if (!componentSet) {
            throw new Error('No component set loaded');
          }

          var set = _.find(componentSet, function(c) {
            return c.componentType === componentType;
          });

          var editorConfig = (set && set.configuration) ? set.configuration['corespring-editor'] : {};
          return editorConfig['placeholder-show-tooltip'];
        };
      }
      return new Definition();
    }
  ]);