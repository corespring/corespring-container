var controller = function ($scope, $location, $http, $timeout, CorespringContainer ) {

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

  $scope.$watch('model', function(m){
    if(!m) {
      return;
    }
    var cleanJson = angular.copy($scope.model);
    $scope.componentJson = JSON.stringify(cleanJson, undefined, 2 );

    CorespringContainer.initialize($scope.model);
    $timeout(function(){
      $scope.$apply(function(){
        CorespringContainer.updateResponses($scope.model.responses);
        CorespringContainer.updateSession($scope.model.session);
      });
    });
  }, true);

  var jsonFile = $location.search().data;
  $http.get(jsonFile)
    .success($scope.onSuccess);
};

angular.module('corespring-rig.controllers')
  .controller(
    'Root',
    ['$scope', '$location', '$http', '$timeout', 'CorespringContainer', controller]
  );
