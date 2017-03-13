angular.module('corespring-editing.controllers')
  .controller('ClientSidePreview', [
    '$log',
    '$scope',
    'ClientSidePlayerService',
    'ComponentData',
    'EDITOR_EVENTS',
    'STATIC_PATHS',
    function ClientSidePreview(
      $log,
      $scope,
      ClientSidePlayerServiceDef,
      ComponentData,
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
        return $scope.questionForComponentId ?
          $scope.questionForComponentId(id) :
          $scope.item.components[id];
      }

      function getItem() {
        return $scope.getItemForScoring ?
          $scope.getItemForScoring() :
          $scope.item;
      }

      var PlayerService = new ClientSidePlayerServiceDef(
        getQuestionForComponentId,
        getItem);

      function setMode(mode) {
        $scope.playerMode = mode;
        ComponentData.setMode(mode);
        ComponentData.setEditable(isGatherMode());
      }

      function isGatherMode() {
        return $scope.playerMode === 'gather';
      }

      $scope.$on('playerControlPanel.submit', function () {
        if (isGatherMode()) {
          submitSession();
        } else {
          setMode('gather');
        }
      });

      $scope.$on('editor.click', function () {
        if (!isGatherMode()) {
          resetPlayer();
        }
      });

      $scope.$on(EDITOR_EVENTS.CONTENT_ADDED_TO_EDITOR, function () {
        setMode('gather');
      });

      $scope.$on('client-side-preview.reset-player', function () {
        resetPlayer();
      });

      $scope.$on('playerControlPanel.reset', function () {
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

      function submitSession() {
        var sessions = ComponentData.getSessions();
        PlayerService.submitSession({
          components: sessions
        },
          function (everything) {
            $scope.responses = everything.responses;
            $scope.session = everything.session;
            $scope.outcome = everything.outcome;
            $scope.score = everything.score;
            $log.info("onSessionLoaded", everything, $scope.score);
            setMode('evaluate');
            ComponentData.setOutcomes(everything.outcome);
          },
          function (err) {
            $log.error("submitSession failed", err);
          });
      }

    }]);

