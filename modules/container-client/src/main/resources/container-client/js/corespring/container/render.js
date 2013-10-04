angular.module('corespring.container', []);

/**
TODO: We need to split this out - some of these functions are called by the player
and shouldn't be available to the components (and vice versa...)
*/
angular.module('corespring.container', []).factory('CorespringContainer', function () {
    var container = {};
    var dataLoaded = false;

    var getAnswer = function(key){
      if(container.data.session && container.data.session.answers){
        return container.data.session.answers[key];
      }
    }

    var getResponse = function(key){
      if(container.data.responses){
        return container.data.responses[key];
      }
    }

    var initializeComponent = function(id, component){

      if(!container.data || !container.data.item || container.data.components){
        return;
      }

      var data = container.data.item.components[id];
      if(data){
        component.setModel(data.model);
      }
      var answer = getAnswer(id);
      if(answer){
        if(component.setAnswer){
          component.setAnswer(answer);
        } else {
          console.warn("Component id: ", id, "has no 'setAnswer' method");
        }
      }

      var response = getResponse(id);
      if(response){
        if(component.setResponse){
          component.setResponse(response);
        } else {
          console.warn("Component id ", id , "has no 'setResponse' method");
        }
      }
    }



    // Set the item data
    container.initialize = function (data) {

      if(!data){
        throw "No data received for initialize call";
      }

      container.data = data;

      dataLoaded = true;

      for(var x in container.components){
        initializeComponent(x, container.components[x]);
      }
    };

    container.getAnswers = function(){

      var answers = {};

      for( var x in container.components){
        var answer = container.components[x].getAnswer();

        if(answer){
          answers[x] = answer;
        }
      }

      return answers;
    };

    container.register = function(componentId, component){
      container.components = container.components || {};

      if(container.components[componentId]){
        throw "A component is already registered with this id: " + componentId;
      }
      container.components[componentId] = component;

      if(dataLoaded){
        initializeComponent(componentId, component);
      }
    };

    container.updateSession = function(sessionInfo) {
      container.session = sessionInfo;

      $.each(container.components, function(id, comp){

        if(comp && comp.setSession && sessionInfo){
          comp.setSession(sessionInfo);
        }
      });

    }

    container.updateResponses = function(responses) {

      container.data.responses = responses;

      var _updateResponse = function(id, comp) {
        var response = container.data.responses[id];

        if(comp && comp.setResponse && response){
          comp.setResponse(response);
        } else {
          console.warn("couldn't set a response for id: ", id);
        }
      }
      $.each(container.components, _updateResponse);
    };

    return container;
  }
);