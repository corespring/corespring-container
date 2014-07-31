angular.module('corespring-player.services')
  .factory('ClientSidePlayerService', [
    '$timeout',
      function($timeout) {

      function ClientSidePlayerService(getQuestionFor, getItem) {

        var settings = {
          maxNoOfAttempts: 1,
          highlightUserResponse: true,
          highlightCorrectResponse: true,
          showFeedback: true
        };

        function createResponse(session) {

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
        }

        function getOutcomes(components, settings) {

          var serverLogic, answer, id, question, out = {};

          function addResponse(id, question, targetOutcome) {
            var answer = components[id].answers;
            serverLogic = corespring.server.logic(question.componentType);
            if (serverLogic && serverLogic.respond) {
              out[id] = serverLogic.respond(question, answer, settings, targetOutcome);
              out[id].studentResponse = _.cloneDeep(answer);
            } else {
              console.warn('didn\'t find server logic for: ', question.componentType);
            }
          }

          for (id in components) {
            question = angular.copy(getQuestionFor(id));
            if (!question.target) {
              addResponse(id, question);
            }
          }

          for (id in components) {
            question = angular.copy(getQuestionFor(id));
            if (question.target) {
              var targetId = question.target.id;
              var targetOutcome = out[targetId];

              addResponse(id, question, targetOutcome);
            }
          }

          return out;
        }

        this.submitSession = function(session, onSuccess, onFailure) {
          console.log("submitSession", session);
          $timeout(function() {
            var response = createResponse(session);
            onSuccess(response);
          });
        };

        this.updateSessionSettings = function(s) {
          settings = s;
        };

      }

      return ClientSidePlayerService;
    }
  ]);