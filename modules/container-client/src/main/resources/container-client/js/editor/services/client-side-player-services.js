(function(){

  var PlayerServices = function($timeout){

    var settings = {};
    var attemptsCountdown = 0;

    var getQuestionFor = function(id){
      throw new Error("Not defined");
    };

    var createResponse = function(answers){

      if( !answers ) {
        throw "Answers is empty";
      }

      attemptsCountdown -= 1;

      var sessionData = {
        isFinished: false,
        remainingAttempts: attemptsCountdown,
        settings: settings
      };

      var out = { session: _.extend(_.cloneDeep(answers))};
      out.session.settings = settings;

      if(attemptsCountdown <= 0){
        out.session.isFinished = true;
        out.session.remainingAttempts = 0;
        out.responses = process(answers.answers, settings);
      }
      return out;
    };

    var process = function(answers, settings){

      var out = {};

      for(var id in answers){
        var answer = answers[id];
        var question = getQuestionFor(id);
        var serverLogic = corespring.server.logic(question.componentType);
        out[id] = serverLogic.respond(question, answer, settings);
      }

      return out;
    };

    this.submitAnswers = function(answers, onSuccess, onFailure){
      $timeout(function(){
       var response = createResponse(answers);
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
  };

  angular.module('corespring-editor.services')
    .service('PlayerServices',
      [
        '$timeout',
        PlayerServices
      ]
    );

})();
