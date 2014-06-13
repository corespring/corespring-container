angular.module('corespring-player.services').factory('ComponentRegister', ['$log',
  function($log) {

    var log = $log.debug.bind($log, '[component-register]');

    var ComponentRegister = function() {

      var editable = null;

      var loaded = {};

      var components = {};

      var answerChangedHandler = function() {};

      this.setAnswerChangedHandler = function(cb) {
        answerChangedHandler = cb;
      };

      this.components = components;
      this.loadedData = {};

      this.registerComponent = function(id, component) {
        log('registerComponent: ', id);

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
        components[id] = undefined;
        delete components[id];
      };

      this.hasComponent = function(id) {
        return !_.isUndefined(components[id]);
      };



      /**
       * @param allData - an object that has the component id as the key and an object
       *                  that has the following format: { data: {}, session : null || {} }
       */
      this.setDataAndSession = function(allData) {
        this.loadedData = allData;
        setAndApplyToComponents(allData, "dataAndSession", "setDataAndSession");
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

      this.resetStash = function() {
        for (var x in components) {
          if (_.isFunction(components[x].resetStash)) {
            components[x].resetStash();
          }
        }
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

        if (!value) {
          throw new Error("No data for: " + name);
        }

        loaded[name] = value;

        if (components) {
          $.each(components, function(id, component) {
            if (loaded[name][id]) {
              component[cb](loaded[name][id]);
            }
          });
        }
      };

    };

    return new ComponentRegister();
  }
]);