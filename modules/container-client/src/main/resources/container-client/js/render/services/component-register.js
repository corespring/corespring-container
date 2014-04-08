angular.module('corespring-player.services').factory('ComponentRegister', ['$log',
  function($log) {

    var ComponentRegister = function() {

      var editable = null;

      var loaded = {};

      var components = {};

      var answerChangedHandler = function() {};

      this.setAnswerChangedHandler = function(cb) {
        answerChangedHandler = cb;
      };

      this.components = components;

      this.registerComponent = function(id, component) {
        components[id] = component;

        if (component.answerChangedHandler && answerChangedHandler) {
          component.answerChangedHandler(answerChangedHandler);
        }

        if (editable !== undefined && editable !== null && component.editable) {
          $log.debug("init ", id, "to editable: ", editable);
          component.editable(editable);
        }

      };

      this.deleteComponent = function(id) {
        delete components[id];
      };

      /**
       * @param allData - an object that has the component id as the key and an object
       *                  that has the following format: { data: {}, session : null || {} }
       */
      this.setDataAndSession = function(allData) {
        setAndApplyToComponents(allData, "dataAndSession", "setDataAndSession");
      };

      /**
       * @param allData - an object that has the component id as the key and an object
       *                  that has the following format: { data: {}, session : null || {} }
       */
      this.setDataAndSession = function(allData) {
        setAndApplyToComponents(allData, "dataAndSession", "setDataAndSession");
      };

      this.setData = function(data) {
        setAndApplyToComponents(data, "data", function(component, data) {
          component.setModel(data.model);
        });
      };

      this.setComponentSessions = function(sessions) {
        setAndApplyToComponents(sessions, "sessions", "setSession");
      };

      this.getComponentSessions = function() {
        var sessions = {};

        for (var x in components) {
          var s = components[x].getSession();
          if (s) {
            sessions[x] = s;
          }
        }
        return sessions;
      };

      this.isAnswerEmpty = function(id) {
        return !components[id] || components[id].isAnswerEmpty();
      };

      this.hasEmptyAnswers = function() {
        return this.interactionCount() > this.interactionsWithResponseCount();
      };

      this.setOutcomes = function(outcomes) {
        //TODO: https://www.pivotaltracker.com/s/projects/926438/stories/61558258
        setAndApplyToComponents(outcomes, "outcomes", "setResponse");
      };

      this.reset = function() {
        $.each(components, function(id, comp) {
          if (comp.reset) {
            comp.reset();
          }
        });
      };

      this.interactionCount = function() {
        return _.keys(components).length;
      };

      this.interactionsWithResponseCount = function() {
        var answered = _.filter(components, function(c) {
          return !c.isAnswerEmpty();
        });
        return answered.length;
      };

      this.setEditable = function(e) {

        editable = e;

        $.each(components, function(id, c) {

          if (!c.editable) {
            throw "editable isn't supported";
          }

          c.editable(editable);
        });
      };

      this.setMode = function(mode) {
        $.each(components, function(id, c) {
          if (c.setMode) {
            c.setMode(mode);
          }
        });
      };

      /**
       * set the value to the 'loaded' object and apply sub objects out to
       * the respective components using their uid.
       * @param value - the value to apply
       * @param name - the name of the property within the loaded object
       * @param cb - either a callback function or a string that names a component function to invoke.
       * If a callback the signature is: function(component, data){}
       */
      var setAndApplyToComponents = function(value, name, cb) {

        if (typeof(cb) === "string") {
          var functionName = cb;
          cb = function(comp, value) {

            if (comp[functionName]) {
              comp[functionName](value);
            }
          };
        }

        if (!value) {
          throw new Error("No answers for: " + name);
        }

        loaded[name] = value;

        if (components) {
          $.each(components, setData(loaded[name], cb));
        }
      };

      var setData = function(data, cb) {
        return _applyValue(data, cb);
      };

      var _applyValue = function(dataHolder, applyFn) {
        return function(id, component) {
          if (!dataHolder || !components) {
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
  }
]);