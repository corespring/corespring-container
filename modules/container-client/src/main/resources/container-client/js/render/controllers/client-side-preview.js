(function () {

  angular.module('corespring-player.controllers')
    .controller('ClientSidePreview', [
      '$log',
      '$scope',
      'ComponentRegister',
      'PlayerService',
      ClientSidePreview
    ]);

  function ClientSidePreview($log, $scope, ComponentRegister, PlayerServiceDef) {

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
      return $scope.data.item.components[id];
    }

    function getItem() {
      return $scope.data.item;
    }

    function setMode(mode) {
      $scope.playerMode = mode;
      ComponentRegister.setMode(mode);
      ComponentRegister.setEditable(isGatherMode());
    }

    function isGatherMode(){
      return $scope.playerMode === 'gather';
    }

    var PlayerService = new PlayerServiceDef(getQuestionForComponentId, getItem);

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
      if ($scope.session) {
        $scope.session.isComplete = false;
        $scope.session.remainingAttempts = 1;
      }
      $scope.score = undefined;
      $scope.outcome = undefined;
      $scope.responses = {};
      ComponentRegister.reset();
      setMode('gather');
    });

    $scope.$on('playerControlPanel.settingsChange', function () {
      PlayerService.updateSessionSettings($scope.playerSettings);
      if(isGatherMode()){
        //nothing to do
      } else {
        submitSession();
      }
    });

    function submitSession() {
      var components = ComponentRegister.getComponentSessions();
      PlayerService.submitSession({
          components: components
        },
        function (everything) {
          $scope.responses = everything.responses;
          $scope.session = everything.session;
          $scope.outcome = everything.outcome;
          $scope.score = everything.score;
          setMode('evaluate');
        },
        function (err) {
          $log.error("submitSession failed", err);
        });
    }

    $scope.resetStash = function () {
      ComponentRegister.resetStash();
    };

    $scope.canSubmit = function () {
      return !ComponentRegister.hasEmptyAnswers();
    };

    $scope.setDataAndSession = function (data) {
      ComponentRegister.setDataAndSession(data);
    };

  }

}).call(this);
