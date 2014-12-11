angular.module('corespring-dev-editor.controllers')
  .controller('DevEditorRoot', [
    '$scope',
    'ItemIdService',
    'ItemService',
    'CatalogPreview',
    'Flash',
    function($scope, ItemIdService, ItemService, CatalogPreview, Flash) {
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
          Flash.info('Saved successfully.');
        }, function() {
          Flash.error('There was an error saving the item.');
        }, $scope.itemId);
      };

      $scope.preview = function() {
        CatalogPreview.launch($scope.itemId);
      };

      $scope.onItemLoadError = function(err) {
        Flash.error("There was an error loading the item.");
      };

      ItemService.load($scope.onItemLoaded, $scope.onItemLoadError, $scope.itemId);
    }
  ]
);