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

        $scope.itemSession = undefined;

        $scope.tryOrGoBack = tryOrGoBack;
        $scope.submitOrReset = submitOrReset;
        $scope.tryButtonLabel = tryButtonLabel;
        $scope.submitButtonLabel = submitButtonLabel;
        $scope.buttonClass = buttonClass;

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

        function tryOrGoBack() {
          ComponentRegister.reset();
          setMode($scope.playerMode != 'instructor' ? 'instructor' : 'gather');
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
          if ($scope.session) {
            $scope.session.isComplete = false;
            $scope.session.remainingAttempts = 1;
          }
          $scope.score = undefined;
          $scope.outcome = undefined;
          $scope.responses = {};
          ComponentRegister.reset();
          setMode('gather');
        }

        function tryButtonLabel() {
          return {
            instructor: "try It"
          }[$scope.playerMode] || "back";
        }

        function submitButtonLabel() {
          return {
            gather: "submit answer"
          }[$scope.playerMode] || "reset";
        }

        function buttonClass() {
          return {
            gather: "info",
            instructor: "primary"
          }[$scope.playerMode] || "danger";
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
            '  <div class="btn-try-holder">',
            '    <button class="btn btn-try" ng-click="tryOrGoBack()">',
            '      {{tryButtonLabel()}}',
            '    </button>',
            '  </div>',
            '  <corespring-isolate-player',
            '    player-mode="playerMode"',
            '    player-markup="xhtml"',
            '    player-item="item"',
            '    player-outcomes="outcome"',
            '    player-session="itemSession">',
            '  </corespring-isolate-player>',
            '  <div class="btn-submit-holder">',
            '    <span ng-hide="playerMode == \'instructor\'">',
            '      <button class="btn btn-submit" ng-click="submitOrReset()">',
            '        {{submitButtonLabel()}}',
            '      </button>',
            '    </span>',
            '  </div>',
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