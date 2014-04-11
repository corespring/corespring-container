var controller = function($scope, $rootScope, $log, $location, $timeout, DataQueryService, ItemService, NavModelService, SupportingMaterialsService) {

  var navSetOnce = false;

  $scope.nav = NavModelService;

  var log = $log.debug.bind($log, '[root] -');

  /** Root data holder for all controllers */
  $scope.data = {
    saveInProgress: false,
    saveError: undefined,
    item: {}
  };

  function supportingMaterialIndex() {
    var match = $location.path().match(/\/supporting-material\/(\d+)/);
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
      /\/item-profile/,
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

  function updateNavBindings() {
    $scope.urlParams = $location.search();
    $scope.showPreview($scope.urlParams);
    log('params', $scope.urlParams);
  }

  $scope.showPreview = function(hidePreview) {
    return !hidePreview && previewable();
  };

  $rootScope.$on('$stateChangeSuccess', function() {
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

  $scope.toggleSupportingMaterials = function() {
    $scope.showSupportingMaterials = !$scope.showSupportingMaterials;
  };

  $scope.showSupportingMaterials = supportingMaterialIndex() !== undefined;

  $scope.save = function() {
    $scope.$broadcast('save-data');
    $scope.data.saveInProgress = true;
    $scope.data.saveError = undefined;
  };

  $scope.itemId = (function() {
    //TODO: This is a temporary means of extracting the session id
    return document.location.pathname.match(/.*\/(.*)\/.*/)[1];
  })();

  $scope.onItemLoaded = function(item) {
    $scope.data.item = item;
    $scope.$broadcast('itemLoaded', item);
  };

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

  DataQueryService.list("gradeLevel", function(result) {
    $scope.gradeLevelDataProvider = result;
  });

  DataQueryService.list("itemType", function(result) {
    $scope.itemTypeDataProvider = result;
    $scope.itemTypeValues = _.chain($scope.itemTypeDataProvider)
      .pluck("value")
      .flatten()
      .value();
  });

  ItemService.load($scope.onItemLoaded, $scope.onItemLoadError, $scope.itemId);

  $timeout(function() {
    updateNavBindings();
    $scope.$apply();
  }, 0);

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
    '$timeout',
    'DataQueryService',
    'ItemService',
    'NavModelService',
    'SupportingMaterialsService',
    controller
  ]);