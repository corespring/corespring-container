var controller = function($scope,$http, $location, $timeout, $log, ComponentRegister, PlayerUtils, PlayerServiceDef) {

  $scope.playerMode = 'gather';

  $scope.playerSettings = {
    maxNoOfAttempts: 1,
    highlightUserResponse: true,
    highlightCorrectResponse: true,
    showFeedback: true,
    allowEmptyResponses: false
  };

  $scope.getQuestionForComponentId = function(id) {
    return $scope.model.item.components[id];
  };

  $scope.getItem = function() {
    return $scope.model.item;
  };

  $scope.getScoringJs = function() {
    var scoringJs = _.find($scope.model.item.files, function(f) {
      return f.name === "scoring.js";
    });
    return scoringJs;
  };

  var PlayerService = new PlayerServiceDef(
    $scope.getQuestionForComponentId,
    $scope.getItem,
    $scope.getScoringJs);

  $scope.aceLoaded = function(_editor) {
    _editor.setTheme("ace/theme/twilight");
    var JsonMode = ace.require("ace/mode/json").Mode;
    _editor.getSession().setMode(new JsonMode());

    _editor.commands.addCommand({
      name: 'updatePreview',
      bindKey: {
        win: 'Ctrl-S',
        mac: 'Ctrl-S',
        sender: 'editor'
      },
      exec: function(env, args, request) {
        $scope.$apply(function() {
          $scope.updatePreview();
        });
      }
    });
  };

  function setMode(mode) {
    $scope.playerMode = mode;
    ComponentRegister.setMode(mode);
    ComponentRegister.setEditable(isGatherMode());
  }


  function onSessionSaved(data) {
    $scope.model.responses = data.responses;
    $scope.model.outcome = data.outcome;
    $scope.outcome = data.outcome;
    $scope.score = data.score;
    $scope.model.score = data.score;
    ComponentRegister.setEditable(false);
  }

  function submitSession(){
    var components = ComponentRegister.getComponentSessions();
    PlayerService.submitSession({
      components: components
    }, onSessionSaved, function() {
      $log.error('There was a problem saving the session');
    });
  }

  $scope.$on('playerControlPanel.submit', function() {
    submitSession();
  });

  $scope.$on('playerControlPanel.reset', function () {
    $scope.model.session = null;
    $scope.model.score = undefined;
    $scope.model.outcome = undefined;
    $scope.model.responses = {};
    ComponentRegister.reset();
    setMode('gather');
  });

  function isGatherMode(){
    return $scope.playerMode === 'gather';
  }

  $scope.$on('playerControlPanel.settingsChange', function () {
    PlayerService.updateSessionSettings($scope.playerSettings);
    if(isGatherMode()){
      //nothing to do
    } else {
      submitSession();
    }
  });

  $scope.updatePreview = function() {
    try {
      $scope.model = JSON.parse($scope.componentJson);
    } catch (e) {
      console.warn("invalid json: ", e);
    }
  };

  $scope.$on('registerComponent', function(event, id, obj) {
    $log.info("registerComponent: ", id);
    ComponentRegister.registerComponent(id, obj);
  });


  $scope.$watch('model', function(newValue, oldValue) {
    if (!newValue || !newValue.item) {
      return;
    }
    var cleanJson = angular.copy($scope.model);
    $scope.componentJson = JSON.stringify(cleanJson, undefined, 2);
    var zipped = PlayerUtils.zipDataAndSession($scope.model.item, $scope.model.session);
    if(!(_.isEqual(newValue.item, oldValue.item) && _.isEqual(newValue.session, oldValue.session))) {
      $timeout(function () {
        ComponentRegister.setDataAndSession(zipped);
      }, 200);
    }
  }, true);

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (decodeURIComponent(pair[0]) === variable) {
        return decodeURIComponent(pair[1]);
      }
    }
  }

  function prepareItemJson(){
    var returnValue = {item: window.itemJson, session: {}};
    return returnValue;
  }

  $scope.model = prepareItemJson();
  ComponentRegister.setEditable(true);
};

angular.module('corespring-rig.controllers')
  .controller(
    'Root', ['$scope','$http' ,'$location', '$timeout', '$log', 'ComponentRegister', 'PlayerUtils', 'ClientSidePlayerService', controller]
);