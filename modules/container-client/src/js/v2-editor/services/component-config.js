angular.module('corespring-editor.services')
  .service('ComponentConfig', [
    'DesignerService',
    function(DesignerService) {

      var componentSet;
      var widgetSet;

      function onLoaded(components) {
        componentSet = components.interactions;
        widgetSet = components.widgets;
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

        this.get = function(componentType) {

          var component = _.find(componentSet, function(component) {
            return component.componentType === componentType;
          });

          return component ? component: _.find(widgetSet, function(widget) {
            return widget.componentType === componentType;
          });
        };
      }
      return new Definition();
    }
  ]);