angular.module('corespring-dev-editor.controllers')
  .controller('DevEditorRoot', [
    '$scope',
    'ItemIdService',
    'ItemService',
    'ComponentData',
    '$timeout',
    function($scope, ItemIdService, ItemService, ComponentData, $timeout) {
      $scope.itemId = ItemIdService.itemId();

      $scope.onItemLoaded = function(item) {
        $scope.item = item;
        ComponentData.setModel(item.components);
        $scope.xhtml = item.xhtml;
        $scope.json = JSON.stringify(item.components, undefined, 2);
      };

      $scope.save = function() {
        $scope.item.xhtml = $scope.xhtml;
        $scope.item.components = JSON.parse($scope.json);
        ItemService.save($scope.item, function() {
          window.alert('success!');
        }, function() {
          window.alert('failure!');
        }, $scope.itemId);
      };


      $scope.aceJsonChanged = function(){

        try{
          var update = JSON.parse($scope.json);
          $scope.item.components = update;

          $timeout(function(){
            $scope.$digest();
          });
        } catch(e) {
          console.warn('bad json', e);
        }
      };

      $scope.onItemLoadError = function(err) {
        window.alert("There was an error. Please try later. Thanks!");
      };

      $scope.$on('registerComponent', function(event, id, componentBridge) {
        ComponentData.registerComponent(id, componentBridge);
      });


      ItemService.load($scope.onItemLoaded, $scope.onItemLoadError, $scope.itemId);
    }
  ]
);
