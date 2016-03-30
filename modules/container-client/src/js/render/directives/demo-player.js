(function() {

  /**
   * This is a directive for conveniently embedding corespring player
   * with basic controls such as Submit and Reset button
   */
  angular.module('corespring-player.directives')
    .factory('DemoComponentRegister', ['ComponentRegisterDefinition',
      function(ComponentRegisterDefinition) {
        return new ComponentRegisterDefinition();
      }
    ])

  .directive('corespringDemoPlayer', ['$log', '$timeout', 'DemoComponentRegister', 'ClientSidePlayerService',
    function($log, $timeout, ComponentRegister, ClientSidePlayerServiceDef) {

      function linkFn($scope) {

        var PlayerService = new ClientSidePlayerServiceDef(getQuestionForComponentId, getItem);

        $scope.playerMode = $scope.mode || 'gather';

        $scope.playerSettings = {
          maxNoOfAttempts: 1,
          highlightUserResponse: true,
          highlightCorrectResponse: true,
          showFeedback: true,
          allowEmptyResponses: false
        };

        $scope.score = NaN;

        $scope.responses = {};

        $scope.session = {
          remainingAttempts: 1,
          settings: _.cloneDeep($scope.playerSettings)
        };

        $scope.itemSession = {};

        $scope.scoreToString = scoreToString;
        $scope.submitOrReset = submitOrReset;
        $scope.submitButtonLabel = submitButtonLabel;

        setMode($scope.playerMode);

        //----------------------------------------------

        function getQuestionForComponentId(id) {
          return $scope.item.components[id];
        }

        function getItem() {
          return $scope.item;
        }

        function setMode(mode) {
          $scope.playerMode = mode;
          ComponentRegister.setMode(mode);
          ComponentRegister.setEditable(isGatherMode());

          if (mode === 'instructor') {
            $timeout(function() {
              ComponentRegister.setInstructorData($scope.item.components);
              ComponentRegister.setMode('instructor');
            }, 100);
          }
        }

        function isGatherMode() {
          return $scope.playerMode === 'gather';
        }

        function submitOrReset() {
          if (isGatherMode()) {
            submit();
          } else {
            reset();
          }
        }

        function submit() {
          var components = ComponentRegister.getComponentSessions();
          PlayerService.submitSession({
              components: components
            },
            onSubmitSessionSuccess,
            onSubmitSessionFailure);
        }

        function onSubmitSessionSuccess(everything) {
          $scope.responses = everything.responses;
          $scope.session = everything.session;
          $scope.outcome = everything.outcome;
          $scope.score = everything.score;
          $log.info("onSessionLoaded", everything, $scope.score);
          setMode('evaluate');
          $scope.isSubmitting = false;
        }

        function onSubmitSessionFailure(err) {
          $log.error("submitSession failed", err);
        }

        function reset() {
          $scope.session = {
            remainingAttempts: 1,
            settings: _.cloneDeep($scope.playerSettings),
            isComplete: false
          };
          $scope.score = undefined;
          $scope.outcome = undefined;
          $scope.responses = {};
          ComponentRegister.reset();
          setMode('gather');
        }

        function submitButtonLabel() {
          return {
            gather: "submit answer"
          }[$scope.playerMode] || "reset";
        }

        function scoreToString(score) {
          var percentage = score && score.summary ? score.summary.percentage : NaN;
          return isNaN(percentage) ? '' : 'Score: ' + percentage + '%';
        }
      }

      return {
        restrict: 'AE',
        scope: {
          xhtml: '=playerMarkup',
          item: '=playerItem',
          mode: '@playerMode'
        },
        link: linkFn,
        template: [
            '<div>',
            '  <corespring-isolate-player',
            '    player-mode="playerMode"',
            '    player-markup="xhtml"',
            '    player-item="item"',
            '    player-outcomes="outcome"',
            '    player-session="session">',
            '  </corespring-isolate-player>',
            '    <div class="btn-submit-holder" ng-hide="playerMode == \'instructor\'">',
            '      <div class="score">',
            '        <span>{{scoreToString(score)}}</span>',
            '      </div>',
            '      <span>',
            '        <button class="btn btn-submit" ng-click="submitOrReset()">',
            '          {{submitButtonLabel()}}',
            '        </button>',
            '      </span>',
            '    </div>',
            '</div>'
          ].join("\n")
      };
      }
    ]);

  angular.module('corespring-player.directives')
    .directive('corespringIsolatePlayer', ['DemoComponentRegister', 'CorespringPlayerDefinition',
      function(DemoComponentRegister, CorespringPlayerDefinition) {
        return new CorespringPlayerDefinition({
          mode: 'player',
          ComponentRegister: DemoComponentRegister
        });
      }
    ]);


}).call(this);