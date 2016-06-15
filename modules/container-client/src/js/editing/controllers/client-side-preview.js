angular.module('corespring-editing.controllers')
  .controller('ClientSidePreview', [
    '$log',
    '$scope',
    'ClientSidePlayerService',
    'ComponentData',
    'ComponentRegister',
    'EDITOR_EVENTS',
    'STATIC_PATHS',
    function ClientSidePreview(
      $log,
      $scope,
      ClientSidePlayerServiceDef,
      ComponentData,
      ComponentRegister,
      EDITOR_EVENTS,
      STATIC_PATHS
    ) {

      $scope.playerLabelImg = STATIC_PATHS.assets + '/item-player-label.png';

      $scope.playerMode = 'gather';

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

      function getQuestionForComponentId(id) {
        return $scope.item.components[id];
      }

      function getItem() {
        return $scope.item;
      }

      var PlayerService = new ClientSidePlayerServiceDef(getQuestionForComponentId, getItem);

      function setMode(mode) {
        $scope.playerMode = mode;
        ComponentData.setMode(mode);
        ComponentData.setEditable(isGatherMode());
      }

      function isGatherMode() {
        return $scope.playerMode === 'gather';
      }

      $scope.$on('testController.setIconSet', function(event, data) {
        ComponentRegister.setPlayerSkin(data);
      });

      $scope.$on('testController.setMode', function(event, data) {
        if (data.mode === 'evaluate') {
          if (data.noAnswer) {
            ComponentData.reset();
            submitSession();
          } else if (data.noFeedback) {
            submitSession({
              maxNoOfAttempts: 1,
              highlightUserResponse: true,
              highlightCorrectResponse: true,
              showFeedback: false
            });
          } else {
            submitSession();
          }
        } else if (data.mode === 'instructor') {
          resetPlayer();
          setMode(data.mode);
          ComponentRegister.setEditable(false);
          ComponentRegister.setInstructorData($scope.item.components);
          if (data.withRationales) {}

        } else if (data.mode === 'view') {
          setMode(data.mode);
        } else {
          resetPlayer();
          setMode(data.mode);
        }
      });

      $scope.$on('playerControlPanel.submit', function() {
        if (isGatherMode()) {
          submitSession();
        } else {
          setMode('gather');
        }
      });

      $scope.$on('editor.click', function() {
        if (!isGatherMode()) {
          resetPlayer();
        }
      });

      $scope.$on(EDITOR_EVENTS.CONTENT_ADDED_TO_EDITOR, function() {
        setMode('gather');
      });

      $scope.$on('client-side-preview.reset-player', function() {
        resetPlayer();
      });

      $scope.$on('playerControlPanel.reset', function() {
        resetPlayer();
      });

      function resetPlayer() {
        if ($scope.session) {
          $scope.session.isComplete = false;
          $scope.session.remainingAttempts = 1;
        }
        $scope.score = undefined;
        $scope.outcome = undefined;
        $scope.responses = {};
        ComponentData.reset();
        setMode('gather');
      }

      function submitSession(settings) {
        var sessions = ComponentData.getSessions();
        settings = _.assign({
          maxNoOfAttempts: 1,
          highlightUserResponse: true,
          highlightCorrectResponse: true,
          showFeedback: true
        }, settings);
        PlayerService.updateSessionSettings(settings);
        PlayerService.submitSession({
            components: sessions
          },
          function(everything) {
            $scope.responses = everything.responses;
            $scope.session = everything.session;
            $scope.outcome = everything.outcome;
            $scope.score = everything.score;
            $log.info("onSessionLoaded", everything, $scope.score);
            setMode('evaluate');
            ComponentData.setOutcomes(everything.outcome);
          },
          function(err) {
            $log.error("submitSession failed", err);
          });
      }

}]);