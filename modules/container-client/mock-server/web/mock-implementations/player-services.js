/* global org */
angular.module('mock.player.services', []);

angular.module('mock.player.services').factory('PlayerService', ['$timeout', 'ResponseProcessor',
  function($timeout, ResponseProcessor) {

    var attemptsCountdown = 2;

    var waitValue = 250;

    var mockData = org.corespring.mock.MockItem.data;

    var settings = {
      showFeedback: true,
      showUserResponse: true,
      showCorrectResponse: true
    };

    var createResponse = function(answers) {

      if (!answers) {
        throw "Answers is empty";
      }

      attemptsCountdown -= 1;

      var sessionData = {
        isFinished: false,
        remainingAttempts: attemptsCountdown
      };

      var out = {
        session: _.extend(_.cloneDeep(answers))
      };

      if (attemptsCountdown <= 0) {
        out.session.isFinished = true;
        out.session.remainingAttempts = 0;
        out.responses = ResponseProcessor.process(mockData.components, answers.answers, settings);
      }
      return out;
    };

    function ServiceDef() {

      this.submitAnswers = function(answerHolder, onSuccess, onFailure) {
        $timeout(function() {
          onSuccess(createResponse(answerHolder));
        }, waitValue);
      };

      this.loadSession = function(onSuccess, onFailure) {
        $timeout(function() {
          onSuccess({
            item: mockData
          });
        }, waitValue);
      };
    }

    return ServiceDef;
  }
]);

angular.module('mock.player.services').factory('ResponseProcessor', [

  function() {

    return {

      process: function(components, answers, settings) {
        var result = {};

        $.each(components, function(id, comp) {
          var serverLogic = org.corespring.mock.ComponentRegister.loadComponent(comp.componentType);

          if (!serverLogic) {
            console.warn("Can't find server logic for: ", comp.componentType);
            result[id] = {};
          } else {
            if (answers[id]) {
              var out = serverLogic.respond(comp, answers[id], settings);
              result[id] = out;
            }
          }
        });

        return result;
      }
    };
  }
]);