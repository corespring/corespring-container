angular.module('corespring-editor.services')
  .service('ComponentData', [
    'LogFactory',
    function(LogFactory) {

      var logger = LogFactory.getLogger('component-data');

      function ComponentData() {
        var components,
          removedComponents = {},
          placeholders = {},
          mockSession = {},
          bridges = {};

        function getNextAvailableId(){

          var idFound = false;
          var id = 0;

          do{
            if(!_.has(components, id.toString()) && !_.has(removedComponents, id.toString())){
              idFound = true;
            }
            id++;
          } while(!idFound);

          return id;
        }

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
          mockSession[id] = mockSession[id] || {};
          bridge.setDataAndSession({
            data: components[id], 
            session: mockSession[id]
          });
        };

        this.addComponent = function(defaultData){
          if(!components){
            throw new Error('components aren\'t defined yet.');
          }

          var id = getNextAvailableId();

          var defaults = {
            weight: 1,
            clean: true
          };

          var newData = _.extend(defaults, _.cloneDeep(defaultData));
          components[id] = newData;
          return id;
        };

        this.deleteComponent = function(id){
          if(!components) {
            throw new Error('no components');
          }   
          
          if(!components[id]) {
            throw new Error('no component with id', id);
          }   

          removedComponents[id] = _.cloneDeep(components[id]);
          delete components[id];
        };

        this.restoreComponent = function(id){
          if(!components) {
            throw new Error('no components');
          }   
          
          if(!removedComponents[id]) {
            throw new Error('no component with id', id);
          }   

          if(_.has(components, id)){
            throw new Error('There is already a component with that id');
          }

          if(!_.has(removedComponents, id)){
            throw new Error('There is no component with that id to restore');
          }

          components[id] = removedComponents[id];
          delete removedComponents[id];
        };
      }

      return new ComponentData();
    }
  ]);
