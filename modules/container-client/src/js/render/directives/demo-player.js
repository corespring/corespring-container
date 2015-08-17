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

        var linkFn = function($scope) {

          //$scope.playerMode = $scope.mode;

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

          function getQuestionForComponentId(id) {
            return $scope.item.components[id];
          }

          function getItem() {
            return $scope.item;
          }

          var PlayerService = new ClientSidePlayerServiceDef(getQuestionForComponentId, getItem);

          function setMode(mode) {
            $scope.playerMode = mode;
            ComponentRegister.setMode(mode);
            ComponentRegister.setEditable(isGatherMode());

            if (mode == 'instructor') {

              $timeout(function() {
                ComponentRegister.setInstructorData($scope.item.components);
                ComponentRegister.setMode('instructor');
              }, 100);
            }
          }

          function isGatherMode() {
            return $scope.playerMode === 'gather';
          }

          $scope.submitOrReset = function() {
            if (isGatherMode()) {
              var components = ComponentRegister.getComponentSessions();
              PlayerService.submitSession({
                  components: components
                },
                function(everything) {
                  $scope.responses = everything.responses;
                  $scope.session = everything.session;
                  $scope.outcome = everything.outcome;
                  $scope.score = everything.score;
                  $log.info("onSessionLoaded", everything, $scope.score);
                  setMode('evaluate');
                  $scope.isSubmitting = false;
                },
                function(err) {
                  $log.error("submitSession failed", err);
                });
            } else {
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
          };

          $scope.buttonLabel = function() {
            return {gather: "Submit Answer", instructor: "Try It"}[$scope.playerMode] || "Reset";
          };

          $scope.buttonClass = function() {
            return {gather: "info", instructor: "default"}[$scope.playerMode] || "danger";
          };

          setMode($scope.playerMode);

        };

        return {
          restrict: 'AE',
          scope: {
            xhtml: '=playerMarkup',
            item: '=playerItem',
            playerMode: '@playerMode'
          },
          link: linkFn,
          template: [
            '<div>',
            '  <corespring-isolate-player',
            '    player-mode="playerMode"',
            '    player-markup="xhtml"',
            '    player-item="item"',
            '    player-outcomes="outcome"',
            '    player-session="itemSession"></corespring-isolate-player>',
            '  <a class="pull-right btn btn-{{buttonClass()}}" ng-click="submitOrReset()">',
            '    {{buttonLabel()}}',
            '  </a>',
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
