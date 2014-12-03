angular.module('corespring-editor.services')
  .service('ComponentData', [
    'LogFactory',
    'ComponentRegister',
    function(LogFactory, ComponentRegister) {

      var logger = LogFactory.getLogger('component-data');

      function ComponentData() {
        var componentModels,
          removedComponentModels = {},
          placeholders = {},
          mockSession = {};

        function getNextAvailableId(){

          var idFound = false;
          var id = 0;

          do{
            if(!_.has(componentModels, id.toString()) && !_.has(removedComponentModels, id.toString())){
              idFound = true;
            }
            id++;
          } while(!idFound && id < 100);

          return id;
        }

        this.getSessions = function(){
          return ComponentRegister.getSessions();
        };

        this.setMode = function(mode){
          ComponentRegister.setMode(mode);
        };

        this.setEditable = function(isEditable){
          ComponentRegister.setEditable(isEditable);
        };

        this.reset = function() {
          ComponentRegister.reset();
        };

        this.updateComponent = function(id, model){
          
          _.forIn(mockSession[id], function(value, key){
            delete mockSession[id][key];
          });

          ComponentRegister.setSingleDataAndSession(id, model, mockSession[id]);
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

        this.registerComponent = function(id, bridge) {
          ComponentRegister.registerComponent(id, bridge);
          mockSession[id] = mockSession[id] || {};
          ComponentRegister.setSingleDataAndSession(id, componentModels[id], mockSession[id]);
        };

        this.addComponent = function(d){
          console.warn('@deprecated use "addComponentModel" instead');
          return this.addComponentModel(d);
        };

        this.addComponentModel = function(defaultData){
          if(!componentModels){
            throw new Error('components aren\'t defined yet.');
          }

          var id = getNextAvailableId();

          var defaults = {
            weight: 1,
            clean: true
          };

          var newData = _.extend(defaults, _.cloneDeep(defaultData));
          componentModels[id] = newData;
          return id;
        };

        this.deleteComponent = function(id){
          if(!componentModels) {
            throw new Error('no components');
          }   
          
          if(!componentModels[id]) {
            throw new Error('no component with id', id);
          }   

          removedComponentModels[id] = _.cloneDeep(componentModels[id]);
          delete componentModels[id];
        };

        this.restoreComponent = function(id){
          if(!componentModels) {
            throw new Error('no components');
          }   
          
          if(!removedComponentModels[id]) {
            throw new Error('no component with id', id);
          }   

          if(_.has(componentModels, id)){
            throw new Error('There is already a component with that id');
          }

          if(!_.has(removedComponentModels, id)){
            throw new Error('There is no component with that id to restore');
          }

          componentModels[id] = removedComponentModels[id];
          delete removedComponentModels[id];
        };
      }

      return new ComponentData();
    }
  ]);
