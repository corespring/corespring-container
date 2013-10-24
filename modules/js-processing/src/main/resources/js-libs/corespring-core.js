//Note: This is a duplicate of core.js in container-client - one of these will need to be removed.
(function(root){

  /**
   * Mock Require only underscore or lodash allowed for now.
   */
  var mockRequire = function(id){
    if(id == "lodash" ||  id == "underscore" ){
      if( _ ){
        return _;
      } else {
        console.log("Can't find underscore or lodash");
        throw "Can't find underscore/lodash";
      }
    } else {
      console.log("Unsupported library: " + id);
      throw "Unsupported library: " + id;
    }
  };

  var loadAngularModule = function (n) {
    try {
      return angular.module(n);
    }
    catch (e) {
      return angular.module(n, []);
    }
  };


  var loadClientSideComponent = function(componentDefinition, directiveName, moduleName){

    var ngModule = loadAngularModule(moduleName);

    if( componentDefinition.directive ){
      ngModule.directive( directiveName, componentDefinition.directive);
    } else if( componentDefinition.directives ){

      var hasDefault = false;

      for( var i = 0; i < componentDefinition.directives.length; i++ ){
        var innerDef = componentDefinition.directives[i];
        var name = innerDef.name ? innerDef.name : directiveName;

        if(!hasDefault){
          hasDefault = innerDef.name === undefined;
        }

        console.log("registering directive: ", moduleName, name);
        ngModule.directive( name, innerDef.directive);
        if(!hasDefault){
          throw "No default directive defined";
        }
      }
    }
  };


  var Server = function(){

    var serverLogic = {};

    var override = {};

    /** Provide an object to which a commonjs module can attach behaviour
     exports.process = function(x,y,z){}
     //Wrapped like so:
     (function(exports, require){
      })(corespring.server.logic(compType), corespring.require)
     */
    this.logic = function(componentType){
      serverLogic[componentType] = serverLogic[componentType] || {};
      return serverLogic[componentType];
    };

    this.itemOverride = function(){
      return override;
    };
  };

  var CorespringCore = function(){
    this.server = new Server();
    this.require = mockRequire;
    this.loadClientSideComponent = loadClientSideComponent;
  };

  if(!root.corespring) {
    root.corespring = new CorespringCore();
  }
})(this);