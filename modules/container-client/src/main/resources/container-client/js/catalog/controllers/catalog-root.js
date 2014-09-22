angular.module('corespring-catalog.controllers')
  .controller('CatalogRoot', [
    '$scope',
    '$location',
    '$log',
    'ItemService',
    'ItemIdService',
    'DataQueryService',
    'ComponentService',
    'ProfileFormatter',
    function(
      $scope,
      $location,
      $log,
      ItemService,
      ItemIdService,
      DataQueryService,
      ComponentService,
      ProfileFormatter) {

      var log = $log.debug.bind($log, '[catalog root] -');

      $scope.unassigned = 'Unassigned';

      $scope.itemId = ItemIdService.itemId();

      var createSupportingMaterialsDropDown = function(item) {
        var groupedSupportingMaterials = _.groupBy(item.supportingMaterials, "materialType");
        $scope.supportingMaterials = [];
        var index = 0;
        var insertSupportingMaterialsForType = function(supMat) {
          $scope.supportingMaterials.push({label: supMat.name, type: "data", index: index});
          index++;
        };
        for (var key in groupedSupportingMaterials) {
          $scope.supportingMaterials.push({label: key, type: "header"});
          _.each(groupedSupportingMaterials[key], insertSupportingMaterialsForType);
          $scope.supportingMaterials.push({type: "divider"});
        }
        $scope.supportingMaterials = _.initial($scope.supportingMaterials);
      };

      $scope.onItemLoaded = function(item) {
        $scope.data = {
          item: item
        };
        $scope.item = item;
        $scope.init();
        createSupportingMaterialsDropDown(item);
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

        function justTypes(name, count) {
          return name;
        }

        $scope.componentTypeLabels = ProfileFormatter.componentTypesUsed($scope.item.components, $scope.availableComponents, justTypes);
      }

      function applyDepthOfKnowledge() {
        var otherAlignments = ($scope.item && $scope.item.profile && $scope.item.profile.otherAlignments) ? $scope.item.profile.otherAlignments : {};
        if (otherAlignments.depthOfKnowledge && $scope.depthOfKnowledgeDataProvider) {
          var obj = _.find($scope.depthOfKnowledgeDataProvider, keyMatch(otherAlignments.depthOfKnowledge));
          $scope.depthOfKnowledgeLabel = obj ? obj.value : undefined;
        }
      }

      function applyAllReviewsPassed() {
        if ($scope.item && $scope.item.profile && $scope.item.profile.taskInfo && $scope.reviewsPassedDataProvider) {
          var keysToRemove = ['All', 'None', 'Other'];
          var cleaned = _.filter($scope.reviewsPassedDataProvider, function(rp) {
            return !_.contains(keysToRemove, rp.key);
          });
          $scope.allReviewsPassed = ProfileFormatter.allReviewsPassed($scope.item.profile.taskInfo.reviewsPassed, cleaned);
        }
      }

      $scope.init = function() {
        var profile = $scope.item.profile || {};

        if (profile.contributorDetails) {
          $scope.licenseTypeUrl = licenseTypeUrl(profile.contributorDetails.licenseType);
        }

        if (profile.contributorDetails && profile.contributorDetails.copyright && profile.contributorDetails.copyright.owner) {
          $scope.copyrightOwnerUrl = copyrightOwnerUrl(profile.contributorDetails.copyright.owner);
        }

        applyDepthOfKnowledge();
        applyComponentTypes();
        applyAllReviewsPassed();
      };

      $scope.getPValueAsString = function (value) {

        var vals = {
          "NO_VALUE": 0,
          "Very Hard": 20,
          "Moderately Hard": 40,
          "Moderate": 60,
          "Easy": 80,
          "Very Easy": 100 };

        var getLabelFromValue = function (numberArray, valueToCheck) {
          for (var x in numberArray) {
            if (valueToCheck <= numberArray[x]) {
              return x === "NO_VALUE" ? "" : x;
            }
          }
        };
        return getLabelFromValue(vals, value);
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

      $scope.$on('$locationChangeSuccess', function() {
        updateNavBindings();
      });

      function updateNavBindings() {
        $scope.urlParams = $location.search();
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

      DataQueryService.list("reviewsPassed", function(result) {
        $scope.reviewsPassedDataProvider = result;
        applyAllReviewsPassed();
      });
    }

  ]);