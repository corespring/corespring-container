angular.module('corespring-editor.services')
  .service('ComponentDefaultData', [
    'LogFactory',
    function(LogFactory) {

      var $log = LogFactory.getLogger('component-default-data');

      function ComponentDefaultData() {
        var componentDefaultData;

        this.setDefaultData = function(componentType, defaultData) {
          if (!componentDefaultData) {
            componentDefaultData = {};
          }
          componentDefaultData[componentType, defaultData];
        };

        this.getDefaultData = function(componentType, path) {
          var p = componentType;
          var resultObj = componentDefaultData;
          var parts = path ? path.split('.') : [];

          while(p && resultObj[p] && parts.length){
            p = parts.shift();
          }

          return resultObj[p] || {};
        };
      }

      return new ComponentDefaultData();
    }
  ]);