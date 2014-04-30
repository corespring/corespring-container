var controller = function($scope, $rootScope, $log, $location, $state, $timeout, DataQueryService, ItemService, ItemIdService, NavModelService, SupportingMaterialsService) {

  var navSetOnce = false;

  $scope.nav = NavModelService;

  var log = $log.debug.bind($log, '[editor root] -');

  /** Root data holder for all controllers */
  $scope.data = {
    saveInProgress: false,
    saveError: undefined,
    item: {}
  };

  $rootScope.$on('$stateChangeSuccess', function() {
    function isOverview() {
      return $scope.isActive('overview') || $scope.isActive('overview-profile') ||
        supportingMaterialIndex('overview-supporting-material') >= 0;
    }

    if (isOverview()) {
      $scope.showOverview = true;
    } else {
      $scope.showOverview = false;
    }

    $scope.showSupportingMaterials = supportingMaterialIndex() !== undefined;
  });


  $scope.onSaveError = function(result) {
    $log.error(result);
  };

  $scope.$on('deleteSupportingMaterial', function(event, data) {
    function deleteSupportingMaterial(index) {
      $scope.data.item.supportingMaterials.splice(index, 1);
        ItemService.save({
          supportingMaterials: $scope.data.item.supportingMaterials
        },
        function() {
          if (index > 0) {
            $state.transitionTo('supporting-material', {
              index: index - 1
            });
          } else {
            $state.transitionTo('supporting-materials');
          }
        },
        $scope.onSaveError, $scope.itemId
      );
    }

    var confirmationMessage = [
      "You are about to delete this file.",
      "Are you sure you want to do this?"
    ].join('\n');

    if (window.confirm(confirmationMessage)) {
      deleteSupportingMaterial(data.index);
    }
  });

  function supportingMaterialIndex(prefix) {
    var re = new RegExp("\\/" + (prefix || 'supporting-material') + "\\/(\\d+)");
    var match = $location.path().match(re);
    return match ? parseInt(match[1], 10) : undefined;
  }

  $scope.supportingMaterialPreviewable = function() {
    var index = supportingMaterialIndex();
    if (index >= 0) {
      return SupportingMaterialsService.previewable($scope.data.item.supportingMaterials, index);
    } else {
      return false;
    }
  };

  function previewable() {
    var matchers = [
      /\/design/,
      $scope.supportingMaterialPreviewable
    ];

    return _.find(matchers, function(matcher) {
      if (matcher instanceof RegExp) {
        return $location.path().match(matcher) !== null;
      } else if (matcher instanceof Function) {
        return matcher();
      } else {
        return false;
      }
    }) !== undefined;
  }

  function updateLocation(name) {
    var update = $location.search()[name] ? undefined : true;
    $location.search(name, update);
  }

  $scope.toggleLeftNav = updateLocation.bind(null, 'hideLeftNav');
  $scope.togglePreview = updateLocation.bind(null, 'hidePreview');

  $scope.$on('$locationChangeSuccess', function() {
    updateNavBindings();
  });

  $scope.$on('open-config-panel', function() {

    if (!$location.search().hideLeftNav) {
      $scope.toggleLeftNav();
    }

    if ($location.search().hidePreview) {
      $scope.togglePreview();
    }
  });

  function updateNavBindings() {
    $scope.urlParams = $location.search();
    $scope.showPreview($scope.urlParams);
    log('params', $scope.urlParams);
  }

  $scope.isPreviewHidden = function() {
    return !_.isUndefined($scope.urlParams.hidePreview);
  };

  $scope.showPreview = function(hidePreview) {
    return !hidePreview && previewable();
  };

  $rootScope.$on('$stateChangeSuccess', function() {
    if ($scope.isActive('design')) {
      $location.search('hidePreview', true);
    }
    $scope.showPreviewButton = previewable();
  });

  $scope.hasSupportingMaterials = function() {
    return $scope.data.item ?
      ($scope.data.item.supportingMaterials && $scope.data.item.supportingMaterials.length > 0) : false;
  };

  $scope.isActive = function(tab) {
    return $location.path().replace(/^\/|\/$/g, '') === tab;
  };

  $scope.isSupportingMaterialActive = function(supportingMaterial, index) {
    return supportingMaterialIndex() === index;
  };

  $scope.isOverviewActive = function(supportingMaterial, index) {
    return supportingMaterialIndex('overview-supporting-material') === index;
  };

  $scope.toggleSupportingMaterials = function() {
    $scope.showSupportingMaterials = !$scope.showSupportingMaterials;
  };

  $scope.toggleOverview = function() {
    $scope.showOverview = !$scope.showOverview;
  };

  $scope.showSupportingMaterials = supportingMaterialIndex() !== undefined;

  $scope.showOverview = true;

  $scope.save = function() {
    $scope.$broadcast('save-data');
    $scope.data.saveInProgress = true;
    $scope.data.saveError = undefined;
  };

  $scope.itemId = ItemIdService.itemId();

  $rootScope.onItemLoaded = function(item) {
    $scope.data.item = item;
    $scope.$broadcast('itemLoaded', item);
  };

  $scope.onItemLoaded = $rootScope.onItemLoaded;

  $scope.onItemLoadError = function(error) {
    $log.warn("Error loading item", error);
  };

  $scope.onItemSaved = function(data) {
    $scope.data.saveInProgress = false;
    $scope.data.saveError = undefined;
  };

  $scope.onItemSaveError = function(error) {
    $log.warn("Error saving item");
    $scope.data.saveInProgress = false;
    $scope.data.saveError = error;
  };

  $scope.deleteSupportingMaterial = function(index) {
    $rootScope.$broadcast('deleteSupportingMaterial', {
      index: index
    });
  };

  DataQueryService.list("gradeLevel", function(result) {
    $scope.gradeLevelDataProvider = result;
  });

  DataQueryService.list("itemType", function(result) {
    $scope.itemTypeDataProvider = result;
    $scope.itemTypeValues = toListOfValues($scope.itemTypeDataProvider);
  });

  function toListOfValues(listOfObjects) {
    return _.chain(listOfObjects)
      .pluck("value")
      .flatten()
      .value();
  }

  $scope.$on('loadItem', function(){
    if($scope.data.item){
      $scope.$broadcast('itemLoaded', $scope.data.item);
    } else {
      log.warn("item not loaded?");
    }
  });

  ItemService.load($scope.onItemLoaded, $scope.onItemLoadError, $scope.itemId);

  updateNavBindings();

  $timeout(function() {
    // add animation now that the ui is set up
    $('.content-container').addClass('cc-transition-left-right');
    $('.preview-hang-right-btn').addClass('cc-transition-right');
  }, 300);
};

angular.module('corespring-editor.controllers')
  .controller('Root', ['$scope',
    '$rootScope',
    '$log',
    '$location',
    '$state',
    '$timeout',
    'DataQueryService',
    'ItemService',
    'ItemIdService',
    'NavModelService',
    'SupportingMaterialsService',
    controller
  ]);