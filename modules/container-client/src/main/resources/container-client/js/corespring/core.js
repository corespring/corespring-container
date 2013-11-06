(function(root){

  var Library = function(){

    var libraries = {
      lodash: _,
      underscore: _
    };

    this.require = function(uid){

      if(!uid){
        throw new Error("you must specify a uid");
      }

      if(libraries[uid]){
        return libraries[uid];
      } else {
        throw new Error("can't find library : " + uid);
      }
    };

    this.library = function(uid){

      if(!uid){
        throw new Error("you must specify a uid");
      }

      libraries[uid] = libraries[uid] || {};
      return libraries[uid];
    };
  };

  var ComponentDefinition = function(angular, directiveName, moduleName){

    var loadAngularModule = function(moduleName){
        try {
          return angular.module(moduleName);
        }
        catch (e) {
          return angular.module(moduleName, []);
        }
    };

    /**
     * Initialize the component
     * @private
     */
    this.initializeComponent = function(){
      var ngModule = loadAngularModule(moduleName);

      if( this.directive ){
        ngModule.directive( directiveName, this.directive);
      } else if( this.directives ){

        var hasDefault = false;

        for( var i = 0; i < this.directives.length; i++ ){
          var innerDef = this.directives[i];
          var name = innerDef.name ? innerDef.name : directiveName;

          if(!hasDefault){
            hasDefault = innerDef.name === undefined;
          }
          ngModule.directive( name, innerDef.directive);
          if(!hasDefault){
            throw "No default directive defined";
          }
        }
      }
    };
  };

  var Client = function(angular){
    var definitions = {};

    this.component = function(directiveName, moduleName){
      definitions[directiveName] = definitions[directiveName] || new ComponentDefinition(angular, directiveName, moduleName);
      return definitions[directiveName];
    };
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

  var Corespring = function(){
    var _library = new Library();
    this.library = _library.library;
    this.require = _library.require;
    this.server = new Server();
    this.client = new Client(root.angular);

    //Override angular if you need to here.
    this.bootstrap = function(angular){
      this.client = new Client(angular);
    };
  };

  if(!root.corespring) {
    root.corespring = new Corespring();
  }
})(this);