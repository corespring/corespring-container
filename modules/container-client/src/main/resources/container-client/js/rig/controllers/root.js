var controller = function($scope, $location, $http, $timeout, $log, ComponentRegister, PlayerUtils, PlayerServiceDef) {

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

  function onSessionSaved(data) {
    $scope.model.responses = data.responses;
    $scope.model.session = data.session;
    $scope.model.outcome = data.outcome;
    $scope.model.score = data.score;
    ComponentRegister.setEditable(false);
  }

  $scope.$on('submitEvent', function() {
    var components = ComponentRegister.getComponentSessions();
    PlayerService.submitSession({
      components: components
    }, onSessionSaved, function() {
      $log.error('There was a problem saving the session');
    });
  });

  $scope.onSuccess = function(data) {
    $scope.model = data;
  };

  $scope.updatePreview = function() {
    try {
      $scope.model = JSON.parse($scope.componentJson);
    } catch (e) {
      console.warn("invalid json: ", e);
      return;
    }
  };

  $scope.$on('registerComponent', function(event, id, obj) {
    $log.info("registerComponent: ", id);
    ComponentRegister.registerComponent(id, obj);
  });


  $scope.$watch('model', function(m) {
    if (!m || !m.item) {
      return;
    }
    var cleanJson = angular.copy($scope.model);
    $scope.componentJson = JSON.stringify(cleanJson, undefined, 2);
    var zipped = PlayerUtils.zipDataAndSession($scope.model.item, $scope.model.session);
    //$timeout(function(){
    //ComponentRegister.setDataAndSession(zipped);
    //}, 200);
  }, true);

  var jsonFile = $location.search().data;
  $http.get(jsonFile)
    .success($scope.onSuccess);
};

angular.module('corespring-rig.controllers')
  .controller(
    'Root', ['$scope', '$location', '$http', '$timeout', '$log', 'ComponentRegister', 'PlayerUtils', 'ClientSidePlayerService', controller]
);