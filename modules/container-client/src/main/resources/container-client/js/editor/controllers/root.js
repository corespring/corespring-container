var controller = function($scope, $log, $location, $timeout, DataQueryService, ItemService, NavModelService, SupportingMaterialsService) {

  $scope.nav = NavModelService;

  function previewable() {
    var matchers = [
      /\/design/,
      /\/item-profile/,
      function() {
        var match = $location.path().match(/\/supporting-material\/(\d+)/);
        var index;
        if (match) {
          index = parseInt(match[1], 10);
          var returnValue = SupportingMaterialsService.previewable($scope.item, index);
          console.log(returnValue);
          return returnValue;
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

  $scope.toggleSupportingMaterials = function() {
    $scope.showSupportingMaterials = !$scope.showSupportingMaterials;
  };

  $timeout(function() {
    var search = $location.search();
    hideShowNav();
    $scope.showPreview = showPreview();
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

  $scope.itemId = (function() {
    //TODO: This is a temporary means of extracting the session id
    return document.location.pathname.match(/.*\/(.*)\/.*/)[1];
  })();

  $scope.onItemLoaded = function(data) {
    $scope.allData = data;
    $scope.item = data.item;
    $scope.$broadcast('itemLoaded', data.item);
  };

  $scope.onItemLoadError = function(error) {
    $log.warn("Error loading item", error);
  };

  $scope.onItemSaved = function(data) {};

  $scope.onItemSaveError = function(error) {
    console.warn("Error saving item");
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
    '$log',
    '$location',
    '$timeout',
    'DataQueryService',
    'ItemService',
    'NavModelService',
    'SupportingMaterialsService',
    controller
  ]);