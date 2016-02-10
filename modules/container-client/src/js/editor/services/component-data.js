angular.module('corespring-editor.services')
  .service('ComponentData', [
    '$timeout',
    'LogFactory',
    'ComponentRegister',
    'MathJaxService',
    function($timeout, LogFactory, ComponentRegister, MathJaxService) {

      var $log = LogFactory.getLogger('component-data');

      function ComponentData() {
        var componentModels,
          removedComponentModels = {},
          placeholders = {},
          mockSession = {},
          elements = {};

        function getNextAvailableId() {
          var MAX_ID = 100;
          for (var i = 0; i < MAX_ID; i++) {
            var id = i.toString();
            if (!_.has(componentModels, id) && !_.has(removedComponentModels, id)) {
              return i;
            }
          }
          throw new Error("More than " + MAX_ID + " components used?");
        }

        function pruneItem(item) {
          if (item) {
            //it is important to clone the item
            //bc. otherwise the editor might save the
            //changes that we do to the item in the component
            item = _.cloneDeep(item);
            delete item.feedback;
            delete item.correctResponse;
          }
          return item;
        }

        function setSingleDataAndSession(id, model, session) {
          $timeout(function() {
            ComponentRegister.setSingleDataAndSession(id, pruneItem(model), session);
          }, 100);
        }

        this.getSessions = function() {
          return ComponentRegister.getSessions();
        };

        this.setMode = function(mode) {
          ComponentRegister.setMode(mode);
        };

        this.setEditable = function(isEditable) {
          ComponentRegister.setEditable(isEditable);
        };

        this.reset = function() {
          ComponentRegister.reset();
        };

        this.updateComponent = function(id, model) {
          _.forIn(mockSession[id], function(value, key) {
            delete mockSession[id][key];
          });

          if (componentModels[id]) {
            componentModels[id] = model;
          }

          setSingleDataAndSession(id, model, mockSession[id]);

          if (elements[id]) {
            MathJaxService.parseDomForMath(10, elements[id]);
          }
        };

        this.setOutcomes = function(outcomes) {
          ComponentRegister.setOutcomes(outcomes);
        };

        this.setModel = function(model) {
          componentModels = model;
          _.forIn(placeholders, function(p, id) {
            p.setComponent(componentModels[id]);
          });
        };

        this.registerPlaceholder = function(id, placeholder) {
          placeholders[id] = placeholder;
          placeholder.setComponent(componentModels[id]);
        };

        this.registerComponent = function(id, bridge, element) {
          mockSession[id] = mockSession[id] || {};
          elements[id] = element;
          ComponentRegister.registerComponent(id, bridge);
          setSingleDataAndSession(id, componentModels[id], mockSession[id]);
        };

        this.addComponent = function(d) {
          console.warn('@deprecated use "addComponentModel" instead');
          return this.addComponentModel(d);
        };

        this.addComponentModel = function(componentData) {
          if (!componentModels) {
            throw new Error('components aren\'t defined yet.');
          }

          var id = getNextAvailableId();

          var defaults = {
            weight: 1,
            clean: true
          };

          var newData = _.extend(defaults, _.cloneDeep(componentData));
          componentModels[id] = newData;
          return id;
        };

        this.deleteComponent = function(id) {
          if (!componentModels) {
            throw new Error('no components');
          }

          if (!componentModels[id]) {
            throw new Error('no component with id', id);
          }

          ComponentRegister.deregisterComponent(id);

          removedComponentModels[id] = _.cloneDeep(componentModels[id]);
          delete componentModels[id];
          delete elements[id];
        };

        this.restoreComponent = function(id) {
          if (!componentModels) {
            throw new Error('no components');
          }

          if (!removedComponentModels[id]) {
            throw new Error('no component with id', id);
          }

          if (_.has(componentModels, id)) {
            throw new Error('There is already a component with that id');
          }

          if (!_.has(removedComponentModels, id)) {
            throw new Error('There is no component with that id to restore');
          }

          componentModels[id] = removedComponentModels[id];

          delete removedComponentModels[id];
        };
      }

      return new ComponentData();
    }
  ]);