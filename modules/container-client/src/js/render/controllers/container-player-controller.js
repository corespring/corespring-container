angular.module('corespring-player.controllers')
  .controller(
    'ContainerPlayerController', [
      '$log',
      '$scope',
      '$location',
      function($log, $scope, $location) {
        $scope.showPreviewButton = ($location.search().showPreviewButton) ? 'true' : 'false';

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

        $scope.$on('playerControlPanel.submit', function() {
          if (isGatherMode()) {
            submitSession();
          } else {
            setMode('gather');
          }
        });

        function isGatherMode() {
          return $scope.playerMode === 'gather';
        }

        function submitSession() {
          setMode("evaluate", {
            saveResponses: {
              isAttempt: true,
              isComplete: true
            },
            options: $scope.playerSettings
          });
        }

        function setMode(mode, options) {
          options = options || {};
          $scope.playerMode = mode;
          $scope.$broadcast("setMode", _.extend({
            mode: mode
          }, options));
        }

        $scope.$on('playerControlPanel.preview', function() {
          $scope.$emit('launch-catalog-preview');
        });

        $scope.$on('playerControlPanel.reset', function() {
          resetSession();
        });

        function resetSession() {
          $scope.$broadcast("resetSession");
          setMode('gather');
        }

        $scope.$on('playerControlPanel.settingsChange', function() {
          if (!isGatherMode()) {
            loadOutcome();
          }
        });

        function loadOutcome() {
          setMode("gather");
          setMode("evaluate", {
            options: $scope.playerSettings
          });
        }

        $scope.$on("initialise", function(event, data) {
          if (data && data.mode) {
            $scope.playerMode = data.mode;
          }
        });

      }
    ]);
