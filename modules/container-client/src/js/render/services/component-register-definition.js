angular.module('corespring-player.services')
  .factory('ComponentRegisterDefinition', ['$log', '$rootScope',
  function($log, $rootScope) {

    var log = $log.debug.bind($log, '[component-register]');

    var NewRegister = function(){

      var bridges = {};

      var answerChangedHandler = null;

      var isEditable = null;

      this.registerComponent = function(id, bridge) {
        log("registerComponent", id, bridge);

        assertBridgeHasExpectedMethods(bridge);

        bridges[id] = bridge;

        if (bridge.answerChangedHandler && answerChangedHandler) {
          bridge.answerChangedHandler(answerChangedHandler);
        }

        if (_.isBoolean(isEditable) && bridge.editable) {
          bridge.editable(isEditable);
        }

        function assertBridgeHasExpectedMethods(bridge){
          var missingMethods = _.filter([
            'answerChangedHandler',
            'editable',
            'getSession',
            'isAnswerEmpty',
            'reset',
            'setDataAndSession',
            'setMode',
            'setResponse'
          ], function(methodName){
            return !_.isFunction(bridge[methodName]);
          });
          if(missingMethods.length > 0){
            throw "Bridge does not have expected methods: " + missingMethods;
          }
        }
      };

      this.setAnswerChangedHandler = function(cb) {
        answerChangedHandler = cb;
      };

      this.setDataAndSession = function(allData) {
        log("setDataAndSession", allData);
        if(window.console && _.isFunction(window.console.warn)){
          console.warn('@deprecated: use "setDataAndSessions(data, sessions)" instead');
        }

        _.forIn(allData, function(ds, id){
          if(bridges[id]){
            bridges[id].setDataAndSession(ds);
          }
        });
      };

      this.setDataAndSessions = function (data, session){
        log("setDataAndSessions", data, session);
        _.forIn(bridges, function(b, key){
          b.setDataAndSession({data: data[key], session: session[key]});
        });
      };

      this.setSingleDataAndSession = function(id, data, session){
        if(bridges[id]){
          log("setSingleDataAndSession", id, data, session);
          bridges[id].setDataAndSession({data: data, session: session});
        }
      };

      this.getComponentSessions = function(){
        $log.warn('@deprecated - use "getSessions()" instead');
        return this.getSessions();
      };

      this.getSessions = function(){
        return _.mapValues(bridges, function(b){
          return b.getSession();
        });
      };
      
      this.deregisterComponent = function(id) {
        bridges[id] = undefined;
        delete bridges[id];
      };

      this.hasComponent = function(id) {
        return !_.isUndefined(bridges[id]);
      };

      this.resetStash = function() {
        $log.warn('@deprecated - soon to be removed');
        _.forIn(bridges, fn('resetStash'));
      };

      this.isAnswerEmpty = function(id) {
        return !bridges[id] || bridges[id].isAnswerEmpty();
      };

      this.hasEmptyAnswers = function() {
        return this.interactionCount() > this.interactionsWithResponseCount();
      };

      var fn = function(fnName, data){
        return function(bridge, id){
          if(bridge[fnName]){
            var d = data ? data[id] : undefined; 
            bridge[fnName](d);
          }
        };
      };

      this.setOutcomes = function(outcomes) {
        _.forIn(bridges, fn('setResponse', outcomes));
      };

      this.setInstructorData = function(data) {
        _.forIn(bridges, fn('setInstructorData', data));
      };

      this.reset = function() {
        _.forIn(bridges, fn('reset'));
      };

      this.interactionCount = function() {
        return _.keys(bridges).length;
      };

      this.interactionsWithResponseCount = function() {
        var answered = _.filter(bridges, function(c) {
          return !c.isAnswerEmpty();
        });
        return answered.length;
      };

      this.setEditable = function(e) {
        isEditable = e;
        _.forIn(bridges, function(b){
          if(b.editable){
            b.editable(isEditable);
          }
        });
      };

      this.setMode = function(mode) {
        _.forIn(bridges, function(b){
          if(b.setMode){
            b.setMode(mode);
          }
        });
      };
    };

    return NewRegister;
  }
]);
