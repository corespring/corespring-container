angular.module('corespring-dev-editor.controllers')
  .controller('DevEditorRoot', [
    '$scope',
    'ItemIdService',
    'ItemService',
    'CatalogPreview',
    function($scope, ItemIdService, ItemService, CatalogPreview) {
      $scope.itemId = ItemIdService.itemId();

      $scope.onItemLoaded = function(item) {
        $scope.item = item;
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

      $scope.preview = function() {
        CatalogPreview.launch($scope.itemId);
      };

      $scope.onItemLoadError = function(err) {
        window.alert("There was an error. Please try later. Thanks!");
      };

      ItemService.load($scope.onItemLoaded, $scope.onItemLoadError, $scope.itemId);
    }
  ]
);