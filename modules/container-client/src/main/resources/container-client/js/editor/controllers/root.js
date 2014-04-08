var controller = function($scope, $rootScope, $log, $location, $timeout, DataQueryService, ItemService, NavModelService, SupportingMaterialsService) {

  $scope.nav = NavModelService;

  function supportingMaterialIndex() {
    var match = $location.path().match(/\/supporting-material\/(\d+)/);
    return match ? parseInt(match[1], 10) : undefined;
  }

  function previewable() {
    var matchers = [
      /\/design/,
      /\/item-profile/,
      function() {
        var index = supportingMaterialIndex();
        if (index) {
          return SupportingMaterialsService.previewable($scope.item, index);
        } else {
          return false;
        }
      }
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

  function showPreview() {
    var search = $location.search();
    return search.preview === true || search.preview === 'true';
  }

  $rootScope.$on('$stateChangeSuccess', function() {
    if (previewable()) {
      $scope.showPreview = showPreview();
    } else {
      $scope.showPreview = false;
    }
  });

  function showLeftNav() {
    var search = $location.search();
    return search.leftnav === true || search.leftnav === 'true';
  }

  function hasSupportingMaterials() {
    return $scope.item ? ($scope.item.supportingMaterials && $scope.item.supportingMaterials.length > 0) : false;
  }

  function hideShowNav() {
    if (showLeftNav()) {
      $('.content-container').css({"left": $('.nav-container').css('width') });
    } else {
      $('.content-container').css({"left": "0"});
    }
  }

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

  $timeout(function() {
    hideShowNav();
    $scope.hasSupportingMaterials = hasSupportingMaterials();
  });


  $scope.toggleLeftNav = function() {
    $location.search('leftnav', !showLeftNav());
    hideShowNav();
  };

  $scope.togglePreview = function() {
    if (previewable()) {
      var show = showPreview();
      $location.search('preview', !show);
      $scope.showPreview = !show;
    } else {
      console.log('not previewable');
    }
  };

  $scope.$on('itemLoaded', function() {
    $scope.hasSupportingMaterials = hasSupportingMaterials();
    if (previewable()) {
      $scope.showPreview = showPreview();
    } else {
      $scope.showPreview = false;
    }
  });

  $scope.save = function() {
    $scope.$broadcast('save-data');
    $scope.saveInProgress = true;
  };

  $scope.itemId = (function() {
    //TODO: This is a temporary means of extracting the session id
    return document.location.pathname.match(/.*\/(.*)\/.*/)[1];
  })();

  $scope.onItemLoaded = function(item) {

    $scope.root = {
      item: item
    };
    $scope.item = item;
    $scope.$broadcast('itemLoaded', item);
  };

  $scope.onItemLoadError = function(error) {
    $log.warn("Error loading item", error);
  };

  $scope.onItemSaved = function(data) {
    $scope.saveInProgress = false;
    $scope.saveError = undefined;
  };

  $scope.onItemSaveError = function(error) {
    console.warn("Error saving item");
    $scope.saveInProgress = false;
    $scope.saveError = error;
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