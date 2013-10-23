(function(){

  var PlayerServices = function($timeout){

    var settings = {};
    var attemptsCountdown = 0;
    var scoringJsFile = {};

    var wrap = function(content){
      return [
        '(function(exports){',
        content,
        '})(corespring.server.itemOverride());'
      ].join("\n");
    };

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

      if(scoringJsFile){
        var def = new Function("exports", scoringJsFile.content);
        def(corespring.server.itemOverride());
        //TODO: Explore this option:
        /*
          var s = document.createElement('script');
          s.src = 'data:text/javascript,' + encodeURIComponent('alert("lorem ipsum")')
          document.body.appendChild(s);
        */
        //TODO: Load item
        out.outcome = corespring.server.itemOverride().process({}, answers.answers);
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
