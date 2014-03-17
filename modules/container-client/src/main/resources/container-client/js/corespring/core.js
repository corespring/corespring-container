(function(root) {

  var ComponentDefinition = function(angular, compName, moduleName) {

    var loadAngularModule = function(moduleName) {
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
    this.initializeComponent = function() {
      var ngModule = loadAngularModule(moduleName);
      var IE = (!!window.ActiveXObject && +(/msie\s(\d+)/i.exec(navigator.userAgent)[1])) || NaN;

      if (this.directive) {

        if (_.isArray(this.directive)) {
          console.debug("[ComponentDefinition] initializeComponent ", moduleName, " - directive: " + compName);
          if (IE < 9) {
            document.createElement(_.toSnakeCase(compName));
          }

          ngModule.directive(compName, this.directive);
        } else if (_.isObject(this.directive)) {
          console.debug("[ComponentDefinition] initializeComponent ", moduleName, " - directive: " + this.directive.name);
          if (IE < 9) {
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
          console.debug("[ComponentDefinition] initializeComponent ", moduleName, " - directive: " + name);
          if (IE < 9) {
            document.createElement(_.toSnakeCase(name));
          }

          ngModule.directive(name, innerDef.directive);
          if (!hasDefault) {
            throw "No default directive defined";
          }
        }
      }

      if (this.service) {
        console.debug("[ComponentDefinition] initializeComponent ", moduleName, " - service: " + compName);
        ngModule.factory(compName, this.service);
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

    var override = {};

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

    this.itemOverride = function() {
      return override;
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