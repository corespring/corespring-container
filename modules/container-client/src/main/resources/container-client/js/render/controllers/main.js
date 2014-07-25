angular.module('corespring-player.controllers')
  .controller(
  'Main', [
    '$location',
    '$log',
    '$scope',
    '$timeout',
    'ComponentRegister',
    'PlayerService',
    function ($location, $log, $scope, $timeout, ComponentRegister, PlayerServiceDef) {

      var currentMode;

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

      var PlayerService = new PlayerServiceDef();

      function setMode(mode) {
        $scope.playerMode = mode;
        ComponentRegister.setMode(mode);
        ComponentRegister.setEditable(isGatherMode());
      }

      function isGatherMode() {
        return $scope.playerMode === 'gather';
      }

      $scope.$on('playerControlPanel.preview', function () {
        $scope.$emit('launch-catalog-preview');
      });

      $scope.$on('playerControlPanel.submit', function () {
        if (isGatherMode()) {
          submitSession();
        } else {
          setMode('gather');
        }
      });

      $scope.$on('playerControlPanel.reset', function () {
        resetSession();
      });

      $scope.$on('playerControlPanel.settingsChange', function () {
        if (isGatherMode()) {
          //nothing to do
        } else {
          ComponentRegister.reset();
          loadOutcome();
        }
      });

      function resetSession() {
        PlayerService.resetSession(onResetSessionSuccess, onResetSessionError, sessionId());
      }

      function onResetSessionSuccess(session) {
        $log.info("onSessionReset", session);
        $scope.session = session;
        $scope.outcome = undefined;
        $scope.score = undefined;
        $scope.responses = {};
        ComponentRegister.reset();
        setMode('gather');
      }

      function onResetSessionError(error) {
        $log.warn("Error resetting session", error);
      }

      function submitSession() {
        var isAttempt = true;
        var isComplete = true;
        var components = ComponentRegister.getComponentSessions();
        PlayerService.saveSession({
            isAttempt: isAttempt,
            isComplete: isComplete,
            components: components
          },
          onSessionSaveSuccess,
          onSessionSaveError,
          sessionId());
      }

      function onSessionSaveError(err) {
        $log.error("submitSession failed", err);
      }

      function onSessionSaveSuccess(session) {
        $scope.session = session;
        $log.info("onSessionSaved", session);
        setMode('evaluate');
        loadOutcome();
      }

      function sessionId() {
        //TODO: This is a temporary means of extracting the session id
        return document.location.pathname.match(/.*\/(.*)\/.*/)[1];
      }

      function loadOutcome() {
        //TODO - need to fetch the player options passed in to the launcher
        $log.log("loadOutcome", $scope.playerSettings);
        PlayerService.loadOutcome($scope.playerSettings,
          onLoadOutcomeSuccess,
          onLoadOutcomeError,
          sessionId()
        );
      }

      function onLoadOutcomeSuccess(data) {
        $scope.outcome = data.outcome;
        $scope.score = data.score;
      }

      function onLoadOutcomeError(err) {
        $log.error(err);
      }

      function loadItemAndSession() {
        PlayerService.loadItemAndSession(onLoadItemAndSessionSuccess, onLoadItemAndSessionError, sessionId());
      }

      function onLoadItemAndSessionSuccess(everything) {
        $scope.rootModel = everything;
        $scope.item = everything.item;
        $scope.session = everything.session;
        $scope.outcome = everything.outcome;
        $scope.score = everything.score;
        $scope.isComplete = everything.session ? everything.session.isComplete : false;
        $scope.$emit("session-loaded", everything.session);
      }

      function onLoadItemAndSessionError(err) {
        $log.error("loadEverything failed", err);
      }

      $scope.$on('begin', function () {
        loadItemAndSession();
      });
    }
  ]);
