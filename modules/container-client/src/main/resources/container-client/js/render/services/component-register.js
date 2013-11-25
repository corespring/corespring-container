angular.module('corespring-player.services').factory('ComponentRegister', ['$log', function($log){

  var ComponentRegister = function(){

    var loaded = {};

    var components = {};

    this.registerComponent = function(id, component){
      $log.info("register component: ", id, " ", component);
      components[id] = component;
    };

    this.setDataAndSession = function(allData){
      setAndApplyToComponents(allData, "dataAndSession", "setDataAndSession");
    };

    this.setData = function(data){
      setAndApplyToComponents(data, "data", function(component, data){
        component.setModel(data.model);
      });
    };

    /**
     * Global Session: contains info like: isFinished, startDate, finishDate..
     */
    this.setGlobalSession = function(session){
      $.each(components, function(id, comp){
        if(comp.setGlobalSession){
          comp.setGlobalSession(angular.copy(session));
        }
      });
    };

    this.setComponentSessions = function(sessions){
      setAndApplyToComponents(sessions, "sessions", "setSession");
    };

    this.getComponentSessions = function () {
      var sessions = {};

      for (var x in components) {
        var s = components[x].getSession();
        if (s) {
          sessions[x] = s;
        }
      }
      return sessions;
    };

    this.hasEmptyAnswers = function() {
      return this.interactionCount() > this.interactionsWithResponseCount();
    };

    this.setResponses = function(responses){
      setAndApplyToComponents(responses, "responses", "setResponse");
    };

    this.reset = function(){
      $.each(components, function(id, comp){
        if (comp.reset) {
          comp.reset();
        }
      });
    };

    this.interactionCount = function(){
      return _.keys(components).length;
    };

    this.interactionsWithResponseCount = function(){
      var answered = _.filter(components, function(c){
        return !c.isAnswerEmpty();
      });
      return answered.length;
    };

    /**
     * set the value to the 'loaded' object and apply sub objects out to
     * the respective components using their uid.
     * @param value - the value to apply
     * @param name - the name of the property within the loaded object
     * @param cb - either a callback function or a string that names a component function to invoke.
     * If a callback the signature is: function(component, data){}
     */
    var setAndApplyToComponents = function(value, name, cb){

      if(typeof(cb) == "string"){
        var functionName = cb;
        cb = function(comp, value){

          if(comp[functionName]){
            comp[functionName](value);
          }
        };
      }

      if(!value){
        throw new Error("No answers for: " + name);
      }

      loaded[name] = value;

      if(components){
        $.each(components, setData(loaded[name], cb ));
      }
    };

    var setData = function(data, cb){
      return _applyValue(data, cb);
    };

    var _applyValue = function(dataHolder, applyFn){
      return function(id, component){
        if (!dataHolder|| !components) {
          return;
        }
        var componentData = dataHolder[id];
        if (componentData) {
          applyFn(component, angular.copy(componentData));
        }
      };
    };

  };

  return new ComponentRegister();
}]);