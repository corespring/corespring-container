angular.module('corespring-editor.services')
  .service('ComponentData', [
    'LogFactory',
    function(LogFactory) {

      var logger = LogFactory.getLogger('component-data');

      function ComponentData() {
        var components,
          placeholders = {},
          bridges = {};

        this.setModel = function(model) {
          components = model;

          _.forIn(placeholders, function(p, id) {
            p.setComponent(components[id]);
          });
        };

        this.registerPlaceholder = function(id, placeholder) {
          placeholders[id] = placeholder;
          placeholder.setComponent(components[id]);
        };

        this.registerComponent = function(id, bridge) {
          bridges[id] = bridge;
          // set data and session etc...
        };
      }

      return new ComponentData();
    }
  ]);
