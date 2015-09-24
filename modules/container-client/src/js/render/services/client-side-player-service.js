/* jshint evil: true */
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

          var customScoringJs = getItem().customScoring;

          var out = {
            session: _.extend(_.cloneDeep(session))
          };
          out.session.isComplete = true;
          out.session.attempts = 1;
          var outcomes = getOutcomes(session.components, settings);
          out.outcome = outcomes;
          out.score = corespring.scoreProcessor.score(angular.copy(getItem()), {}, outcomes);
          if (customScoringJs) {
            var exports = {};
            try {
              eval(customScoringJs);
              var score = exports.process(angular.copy(getItem()), session, outcomes);
              //var score = exports.process(getItem(), session, outcomes);
              out.score = score;
            } catch (e) {
              console.warn('error while processing custom scoring: ', e);
            }
          }
          return out;
        }

        function getOutcomes(components, settings) {

          var serverLogic, answer, id, question, out = {};

          function addResponse(id, question, targetOutcome) {
            serverLogic = corespring.server.logic(question.componentType);
            if(!serverLogic) {
              console.warn('didn\'t find server logic for: ', question.componentType);
              return;
            }
            if(!serverLogic.createOutcome){
              console.warn('didn\'t find serverLogic.createOutcome: ', question.componentType);
              return;
            }
            var answer = components[id].answers;
            out[id] = serverLogic.createOutcome(question, answer, settings, targetOutcome);
            out[id].studentResponse = _.cloneDeep(answer);
          }

          for (id in components) {
            question = getQuestionFor(id);
            if (!question.target) {
              addResponse(id, angular.copy(question));
            }
          }

          for (id in components) {
            question = getQuestionFor(id);
            if (question.target) {
              var targetId = question.target.id;
              var targetOutcome = out[targetId];

              addResponse(id, angular.copy(question), targetOutcome);
            }
          }

          return out;
        }

        this.submitSession = function(session, onSuccess, onFailure) {
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