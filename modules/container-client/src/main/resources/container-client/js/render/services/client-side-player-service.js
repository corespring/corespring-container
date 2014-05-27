angular.module('corespring-player.services')
  .factory('PlayerService', [
    '$timeout',
    function($timeout) {

      var PlayerService = function(getQuestionFor, getItem, getScoringJsFile) {

        var settings = {
          maxNoOfAttempts: 1,
          highlightUserResponse: true,
          highlightCorrectResponse: true,
          showFeedback: true
        };

        var attemptsCountdown = 0;

        var createResponse = function(session) {

          if (!session) {
            throw "Sessions is empty";
          }

          var out = {
            session: _.extend(_.cloneDeep(session))
          };
          out.session.isComplete = true;
          out.session.attempts = 1;
          var outcomes = getOutcomes(session.components, settings);
          out.outcome = outcomes;
          out.score = corespring.scoreProcessor.score(angular.copy(getItem()), {}, outcomes);
          return out;
        };

        var getOutcomes = function(components, settings) {

          var out = {};
          var serverLogic, answer, id, question;

          for (id in components) {
            question = angular.copy(getQuestionFor(id));
            if (!question.target) {
              answer = components[id].answers;
              serverLogic = corespring.server.logic(question.componentType);
              out[id] = serverLogic.respond(question, answer, settings);
              out[id].studentResponse = _.cloneDeep(answer);
            }
          }

          for (id in components) {
            question = angular.copy(getQuestionFor(id));
            if (question.target) {
              answer = components[id].answers;
              var targetId = question.target.id;
              var targetOutcome = out[targetId];
              serverLogic = corespring.server.logic(question.componentType);
              out[id] = serverLogic.respond(question, answer, settings, targetOutcome);
            }
          }

          return out;
        };

        this.submitSession = function(session, onSuccess, onFailure) {
          $timeout(function() {
            var response = createResponse(session);
            onSuccess(response);
          });
        };

        this.updateSessionSettings = function(s) {
          settings = s;
          attemptsCountdown = settings.maxNoOfAttempts;
        };

      };

      return PlayerService;
    }
  ]);