var controller = function($scope, $location, $log, ItemService) {
  $scope.selectedTab = $location.search().tab;

  if ($scope.selectedTab === 'supporting-material') {
    $scope.supportingMaterialIndex = $location.search().index;
  }

  $scope.printMode = $location.search().printMode;

  $scope.itemId = (function() {
    //TODO: This is a temporary means of extracting the session id
    return document.location.pathname.match(/.*\/(.*)\/.*/)[1];
  })();

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
    controller
  ]);