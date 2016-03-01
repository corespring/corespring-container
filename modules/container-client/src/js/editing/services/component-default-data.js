angular.module('corespring-editing.services')
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
          componentDefaultData[componentType] = defaultData;
        };

        this.getDefaultData = function(componentType, path) {
          var p = componentType;
          var resultObj = componentDefaultData;
          var parts = path ? path.split('.') : [];

          while(p && resultObj[p] && parts.length){
            resultObj = resultObj[p];
            p = parts.shift();
          }

          if(!resultObj[p]) {
            var msg = 'Default data is empty for component: ' + componentType;
            if(path){
              msg += ' at path: ' + path;
            }
            msg += '.';
            $log.warn(msg);
            return {};
          }

          return resultObj[p];
        };
      }

      return new ComponentDefaultData();
    }
  ]);