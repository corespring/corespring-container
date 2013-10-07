//A component that holds the server logic
window.org = window.org || {};
org.corespring = org.corespring || {};
org.corespring.mock = org.corespring.mock || {};

var ComponentRegister = function(){

  var registeredComponents = {};

  this.register = function(componentType, def){
    registeredComponents[componentType] = def;
  };

  this.loadComponent = function(componentType){
    return registeredComponents[componentType];
  }
};

org.corespring.mock.ComponentRegister = new ComponentRegister();
