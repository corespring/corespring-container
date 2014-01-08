var controller = function ($scope, $location, $http, $timeout, $log, ComponentRegister, PlayerUtils ) {

 $scope.aceLoaded = function(_editor){
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
        $scope.$apply(function(){
          $scope.updatePreview();
        });
      }
    });
  };

  $scope.onSuccess = function(data){
    $scope.model = data;
  };

  $scope.updatePreview = function(){
    try{
      $scope.model = JSON.parse($scope.componentJson);
    } catch (e) {
      console.warn("invalid json: ", e);
      return;
    }
  };

   $scope.$on('registerComponent', function(event, id, obj){
     $log.info("registerComponent: ", id);
      ComponentRegister.registerComponent(id, obj);
    });


  $scope.$watch('model', function(m){
    if(!m) {
      return;
    }
    var cleanJson = angular.copy($scope.model);
    $scope.componentJson = JSON.stringify(cleanJson, undefined, 2 );
    var zipped = PlayerUtils.zipDataAndSession($scope.model.item, $scope.model.session);
    $timeout(function(){
      ComponentRegister.setDataAndSession(zipped);
    });
  }, true);

  var jsonFile = $location.search().data;
  $http.get(jsonFile)
    .success($scope.onSuccess);
};

angular.module('corespring-rig.controllers')
  .controller(
    'Root',
    ['$scope', '$location', '$http', '$timeout', '$log', 'ComponentRegister', 'PlayerUtils', controller]
  );
