(function(){

  var PlayerServices = function($timeout){

    var settings = {};
    var attemptsCountdown = 0;
    var scoringJsFile = {};

    var getQuestionFor = function(id){
      throw new Error("Not defined");
    };

    var getItem = function(){
      throw new Error("Not defined");
    };

    var createResponse = function(session){

      if(!session) {
        throw "Sessions is empty";
      }

      attemptsCountdown -= 1;

      var sessionData = {
        isFinished: false,
        remainingAttempts: attemptsCountdown,
        settings: settings
      };

      var out = { session: _.extend(_.cloneDeep(session))};
      out.session.settings = settings;

      if(attemptsCountdown <= 0){
        out.session.isFinished = true;
        out.session.remainingAttempts = 0;
        var responses = process(session.components, settings);
        out.responses = responses;
        out.outcome = corespring.outcomeProcessor.outcome(angular.copy(getItem()), {}, responses);
      }

      return out;
    };

    var process = function(components, settings){

      var out = {};

      for(var id in components){
        var answer = components[id].answers;
        var question = angular.copy(getQuestionFor(id));
        var serverLogic = corespring.server.logic(question.componentType);
        out[id] = serverLogic.respond(question, answer, settings);
      }

      return out;
    };

    this.submitSession = function(session, onSuccess, onFailure){
      $timeout(function(){
       var response = createResponse(session);
       onSuccess(response);
      });
    };

    this.updateSessionSettings = function(s){
      settings = s;
      attemptsCountdown = settings.maxNoOfAttempts;
    };

    this.setQuestionLookup = function(cb){
      getQuestionFor = cb;
    };

    this.setItemLookup = function(cb){
      getItem = cb;
    };

    this.setScoringJs = function(scoringJs){
      scoringJsFile = scoringJs;
    };

  };

  angular.module('corespring-editor.services')
    .service('PlayerServices',
      [
        '$timeout',
        PlayerServices
      ]
    );

})();
