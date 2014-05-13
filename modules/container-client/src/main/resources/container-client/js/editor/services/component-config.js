angular.module('corespring-editor.services')
  .service('ComponentConfig', [
    '$location',
    '$rootScope',
    function() {
      function Definition() {
        this.showTooltip = function(componentType) {
          return _.contains(
            [
              'corespring-inline-choice',
              'corespring-text-entry'
            ],
            componentType
          );
        };
      }
      return new Definition();
    }
  ]);