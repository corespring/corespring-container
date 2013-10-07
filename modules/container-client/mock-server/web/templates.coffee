_ = require 'lodash'

exports.moduleName = (org, comp) -> "#{org}.#{comp}"
exports.directiveName = (org, comp) -> "#{hyphenToCamel(org)}#{hyphenToTitle(comp)}"

hyphenToCamel = (s) -> hyphenToTitle(s, false)

hyphenToTitle = (s, capitalizeFirstLetter = true) ->
  words = s.split("-")
  firstWord = if capitalizeFirstLetter then capitalize(words[0]) else words[0]
  firstWord + (_.map words[1..], capitalize).join("")

capitalize = (string) -> string.charAt(0).toUpperCase() + string.substring(1).toLowerCase()

exports.wrapInMockComponentRegister = (org, component, jsString) ->

  """
  (function(){
    //Mock Server logic to allow for client side processing
    var exports = {};
    #{jsString}
    org.corespring.mock.ComponentRegister.register( '#{org}-#{component}', exports);
  })();
  """

exports.wrapMockData = (json) ->
  """
  (function(){
    //Wrap the json in a container object.
    window.org = window.org || {};
    org.corespring = org.corespring || {};
    org.corespring.mock = org.corespring.mock || {};
    org.corespring.mock.MockItem = {
      data: #{json}
    };
  })();
  """
exports.wrapComponent = (org, component, jsString) ->

  directiveName = @directiveName(org, component)
  moduleName = @moduleName(org, component)

  """
  (function(){

    // A stop gap until we think about namespacing config + preview defs.
    var loadAngular = function(n){
      try{
        return angular.module(n);
      }
      catch(e){
        console.warn("error instantiating module: ", n);
        return angular.module(n, []);
      }
    }

    #{jsString}

    var moduleName = '#{moduleName}';

    var ngModule = loadAngular(moduleName);

    if( componentDefinition.directive ){
      ngModule.directive( '#{directiveName}', componentDefinition.directive);
    } else if( componentDefinition.directives ){

      var hasDefault = false;

      for( var i = 0; i < componentDefinition.directives.length; i++ ){
        var innerDef = componentDefinition.directives[i];
        var name = innerDef.name ? innerDef.name : '#{directiveName}';

        if(!hasDefault){
          hasDefault = innerDef.name == undefined;
        };

        console.log("registering directive: ", moduleName, name);
        ngModule.directive( name, innerDef.directive);
        if(!hasDefault){
          throw "No default directive defined"
        }
      }
    }
  })();
  """