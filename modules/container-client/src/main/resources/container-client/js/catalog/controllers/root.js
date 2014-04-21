var controller = function($scope, $location, $log, ItemService, ItemIdService) {
  $scope.selectedTab = $location.search().tab;

  if ($scope.selectedTab === 'supporting-material') {
    $scope.supportingMaterialIndex = $location.search().index;
  }

  $scope.printMode = $location.search().printMode;

  $scope.itemId = ItemIdService.itemId();

  $scope.onItemLoaded = function(item) {
    $scope.item = item;
    $scope.$broadcast('itemLoaded', item);
  };

  $scope.onItemLoadError = function(error) {
    $log.warn("Error loading item", error);
  };

  ItemService.load($scope.onItemLoaded, $scope.onItemLoadError, $scope.itemId);

};

angular.module('corespring-catalog.controllers')
  .controller('Root', ['$scope',
    '$location',
    '$log',
    'ItemService',
    'ItemIdService',
    controller
  ]);