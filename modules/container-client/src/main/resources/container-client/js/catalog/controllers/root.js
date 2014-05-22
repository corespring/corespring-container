angular.module('corespring-catalog.controllers')
  .controller('CatalogRoot', [
    '$scope',
    '$location',
    '$log',
    'ItemService',
    'ItemIdService',
    'PlayerService',
    'DataQueryService',
    'ComponentService',
    'ProfileFormatter',
    function(
      $scope,
      $location,
      $log,
      ItemService,
      ItemIdService,
      PlayerService,
      DataQueryService,
      ComponentService,
      ProfileFormatter) {
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
        $scope.init();
        $scope.$broadcast('itemLoaded', item);
      };

      $scope.onComponentsLoaded = function(components) {
        $scope.availableComponents = components;
        applyComponentTypes();
      };

      $scope.onComponentsLoadError = function(err) {
        $log.error('Error loading available components', err);
      };

      function keyMatch(key) {
        return function(keyValue) {
          return keyValue.key === key;
        };
      }

      function applyComponentTypes() {

        if (!$scope.item || !$scope.item.components || !$scope.availableComponents) {
          return;
        }

        $scope.componentTypeLabels = ProfileFormatter.componentTypesUsed($scope.item.components, $scope.availableComponents);
      }

      function applyDepthOfKnowledge() {
        var profile = $scope.item ? $scope.item.profile.otherAlignments : {};
        if (profile.depthOfKnowledge && $scope.depthOfKnowledgeDataProvider) {
          var obj = _.find($scope.depthOfKnowledgeDataProvider, keyMatch(profile.depthOfKnowledge));
          $scope.depthOfKnowledgeLabel = obj ? obj.value : undefined;
        }
      }


      $scope.init = function() {
        var profile = $scope.item.profile || {};

        if (profile.contributorDetails) {
          $scope.licenseTypeUrl = licenseTypeUrl(profile.contributorDetails.licenseType);
        }

        if (profile.contributorDetails.copyright || profile.contributorDetails.copyright.owner) {
          $scope.copyrightOwnerUrl = copyrightOwnerUrl(profile.contributorDetails.copyright.owner);
        }

        applyDepthOfKnowledge();
        applyComponentTypes();
      };

      function imageUrl(folder, name, fallback) {
        return name ? '../../images/' + folder + '/' + name.replace(" ", "-") + ".png" : fallback;
      }

      function licenseTypeUrl(licenseType) {
        return imageUrl('licenseTypes', licenseType);
      }

      function copyrightOwnerUrl(owner) {
        return imageUrl('copyright', owner);
      }

      $scope.onItemLoadError = function(error) {
        $log.warn("Error loading item", error);
      };

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

      ItemService.load($scope.onItemLoaded, $scope.onItemLoadError, $scope.itemId);
      ComponentService.loadAvailableComponents($scope.onComponentsLoaded, $scope.onComponentsLoadError);

      DataQueryService.list("depthOfKnowledge", function(result) {
        $scope.depthOfKnowledgeDataProvider = result;
        applyDepthOfKnowledge();
      });
    }

  ]);