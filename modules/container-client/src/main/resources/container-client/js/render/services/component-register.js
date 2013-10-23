angular.module('corespring-player.services').factory('ComponentRegister', ['$log', function($log){


  var ComponentRegister = function(){

    var loaded = {};

    var components = {};

    this.registerComponent = function(id, component){
      $log.info("register component: ", id, " ", component);
      components[id] = component;
    };

    this.setData = function(data){
      setAndApplyToComponents(data, "data", function(component, data){
        component.setModel(data.model);
      });
    };

    this.setSession = function(session){
      setAndApplyToComponents(session, "session", "setSession");
    };

    this.setAnswers = function(answers){
      setAndApplyToComponents(answers, "answers", "setAnswer");
    };

    this.setResponses = function(responses){
      setAndApplyToComponents(responses, "responses", "setResponse");
    };

    this.getAnswers = function () {
      var answers = {};

      for (var x in components) {
        var answer = components[x].getAnswer();
        if (answer) {
          answers[x] = answer;
        }
      }
      return answers;
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

/*
var loadAngular = function (n) {
  try {
    return angular.module(n);
  }
  catch (e) {
    return angular.module(n, []);
  }
};

var module = loadAngular('corespring.container');

module.factory('CorespringContainer', function () {
    var container = {};
    var dataLoaded = false;

    var getAnswer = function (key) {
      if (container.data.session && container.data.session.answers) {
        return container.data.session.answers[key];
      }
    };

    var getResponse = function (key) {
      if (container.data.responses) {
        return container.data.responses[key];
      }
    };

    var initializeComponent = function (id, component, fullModel) {
      if (!container.data || !container.data.item || container.data.components) {
        return;
      }

      var data = container.data.item.components[id];
      if (data) {
        component.setModel(fullModel ? data : data.model);
      }
      var answer = getAnswer(id);
      if (answer) {
        if (component.setAnswer) {
          component.setAnswer(answer);
        } else {
          console.warn("Component id: ", id, "has no 'setAnswer' method");
        }
      }

      var response = getResponse(id);
      if (response) {
        if (component.setResponse) {
          component.setResponse(response);
        } else {
          console.warn("Component id ", id, "has no 'setResponse' method");
        }
      }
    };

    // Set the item data
    container.initialize = function (data) {
      console.log("Calling initialize");
      if (!data) {
        throw "No data received for initialize call";
      }

      container.data = data;
      dataLoaded = true;

      if (container.components) $.each(container.components, initializeComponent);
      if (container.configPanels) $.each(container.configPanels, initializeComponent);
    };

    container.getAnswers = function () {
      var answers = {};

      for (var x in container.components) {
        var answer = container.components[x].getAnswer();
        if (answer) {
          answers[x] = answer;
        }
      }

      return answers;
    };

    container.register = function (componentId, component) {
      container.components = container.components || {};

      if (container.components[componentId]) {
        console.warn("A component is already registered with this id: " + componentId);
      }

      container.components[componentId] = component;

      if (dataLoaded) {
        initializeComponent(componentId, component);
      }
    };

    container.registerConfigPanel = function (componentId, component) {
      container.configPanels = container.configPanels || {};
      if (container.configPanels[componentId]) {
        console.warn("A config panel is already registered with this id: " + componentId);
      }
      container.configPanels[componentId] = component;
      if (dataLoaded) {
        initializeComponent(componentId, component, true);
      }
    };

    container.updateSession = function (sessionInfo) {
      container.session = sessionInfo;

      if(!container.components){
        return;
      }

      $.each(container.components, function (id, comp) {
        if (comp && comp.setSession && sessionInfo) {
          comp.setSession(sessionInfo);
        }
      });
    };

    container.updateResponses = function (responses) {
      container.data.responses = responses;
      var _updateResponse = function (id, comp) {
        if (comp && comp.setResponse && container.data.responses) {
          var response = container.data.responses[id];
          comp.setResponse(response);
        } else {
          console.warn("couldn't set a response for id: ", id);
        }
      };

      if(!container.components){
        return;
      }
      $.each(container.components, _updateResponse);
    };

    container.serialize = function (itemModel) {

      if (!container.configPanels) return itemModel;

      var newModel = _.cloneDeep(itemModel);
      _.each(newModel.components, function(value, key) {
        var component = container.configPanels[key];
        if (component && component.getModel) {
          newModel.components[key] = component.getModel();
        }
      });
      return newModel;
    };

    return container;
  }
);*/