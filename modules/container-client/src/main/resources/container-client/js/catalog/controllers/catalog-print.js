var controller = function($scope, $location, ItemService) {
  $scope.selectedTab = $location.search().tab;
  if ($scope.selectedTab === 'supporting-material') {
    $scope.supportingMaterialIndex = $location.search().index;
  }
};

angular.module('corespring-catalog.controllers')
  .controller('CatalogPrint', ['$scope',
    '$location',
    'ItemService',
    controller
  ]);