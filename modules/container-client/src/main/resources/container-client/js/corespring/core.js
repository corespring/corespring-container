/*global head:false */

(function(root) {

  var ComponentDefinition = function(angular, compName, moduleName) {

    var loadAngularModule = function(moduleName) {
      try {
        return angular.module(moduleName);
      } catch (e) {
        return angular.module(moduleName, []);
      }
    };

    /**
     * Initialize the component
     * @private
     */
    this.initializeComponent = function() {
      var ngModule = loadAngularModule(moduleName);
      var isIE8 = (typeof head !== 'undefined' && head.browser.ie && head.browser.version < 9);

      if (this.directive) {

        if (_.isArray(this.directive)) {
          if (isIE8) {
            document.createElement(_.toSnakeCase(compName));
          }

          ngModule.directive(compName, this.directive);
        } else if (_.isObject(this.directive)) {
          if (isIE8) {
            document.createElement(_.toSnakeCase(this.directive.name));
          }
          ngModule.directive(this.directive.name, this.directive.directive);

        }
      }

      if (this.directives) {

        var hasDefault = false;

        for (var i = 0; i < this.directives.length; i++) {
          var innerDef = this.directives[i];
          var name = innerDef.name ? innerDef.name : compName;

          if (!hasDefault) {
            hasDefault = innerDef.name === undefined;
          }
          if (isIE8) {
            document.createElement(_.toSnakeCase(name));
          }

          ngModule.directive(name, innerDef.directive);
          if (!hasDefault) {
            throw "No default directive defined";
          }
        }
      }

      if (this.factory) {
        ngModule.factory(compName, this.factory);
      }

      if (this.service) {
        ngModule.service(compName, this.service);
      }
    };
  };

  var Client = function(angular) {
    var definitions = {};

    this.component = function(directiveName, moduleName) {
      var fullyQualifiedName = moduleName + "-" + directiveName;
      definitions[fullyQualifiedName] = definitions[fullyQualifiedName] || new ComponentDefinition(angular, directiveName, moduleName);
      return definitions[fullyQualifiedName];
    };
  };

  var Server = function() {

    var serverLogic = {};

    var scoring = {};

    /** Provide an object to which a commonjs module can attach behaviour
     exports.process = function(x,y,z){}
     //Wrapped like so:
     (function(exports, require){
      })(corespring.server.logic(compType), corespring.require)
     */
    this.logic = function(componentType) {
      serverLogic[componentType] = serverLogic[componentType] || {};
      return serverLogic[componentType];
    };

    this.customScoring = function() {
      return scoring;
    };
  };

  var Corespring = function() {
    this.server = new Server();
    this.client = new Client(root.angular);

    //Override angular if you need to here.
    this.bootstrap = function(angular) {
      this.client = new Client(angular);
    };
  };

  if (!root.corespring) {
    root.corespring = {};
  }

  var extension = new Corespring();

  for (var x in extension) {
    root.corespring[x] = extension[x];
  }
})(this);