angular.module('corespring-catalog.controllers')
  .controller('CatalogRoot', [
    '$scope',
    '$location',
    '$log',
    'ItemService',
    'ItemIdService',
    'PlayerService',
    function($scope, $location, $log, ItemService, ItemIdService, PlayerService) {
      $scope.selectedTab = $location.search().tab;

      var log = $log.debug.bind($log, '[catalog root] -');

      $scope.unassigned = 'Unassigned';

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

      PlayerService.setQuestionLookup(function(id) {
        return $scope.item.components[id];
      });

      PlayerService.setItemLookup(function() {
        return $scope.item;
      });

      $scope.$on('$locationChangeSuccess', function() {
        updateNavBindings();
      });

      function updateNavBindings() {
        $scope.urlParams = $location.search();
        //$scope.showPreview($scope.urlParams);
        log('params', $scope.urlParams);
      }

      function updateLocation(name) {
        log('updateLocation: ', name);
        var update = $location.search()[name] ? undefined : true;
        $location.search(name, update);
      }

      $scope.toggleLeftNav = updateLocation.bind(null, 'hideLeftNav');

    }

  ]);