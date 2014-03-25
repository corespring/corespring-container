var controller = function($scope, $log, $location, $timeout, DataQueryService, ItemService, NavModelService) {

  $scope.nav = NavModelService;

  var previewable = [
    '/design',
    '/item-profile'
  ];

  function showPreview() {
    var search = $location.search();
    return search.preview === true || search.preview === 'true';
  }

  function showLeftNav() {
    var search = $location.search();
    return search.leftnav === true || search.leftnav === 'true';
  }

  $timeout(function() {
    var search = $location.search();
    $scope.showLeftNav = showLeftNav();
    $scope.showPreview = showPreview();
  });

  $scope.toggleLeftNav = function(updateLocation) {
    var show = showLeftNav();
    $location.search('leftnav', !show);
    $scope.showLeftNav = !show;
  };

  $scope.togglePreview = function() {
    if (_.contains(previewable, $location.path())) {
      var show = showPreview();
      $location.search('preview', !show);
      $scope.showPreview = !show;
    }
  };

  $scope.$on('$locationChangeSuccess', function() {
    NavModelService.chooseNavEntry($location.path());

    if (_.contains(previewable, $location.path())) {
      $scope.showPreview = showPreview();
    } else {
      $scope.showPreview = false;
    }
  });

  NavModelService.chooseNavEntry($location.path());

  $scope.itemId = (function() {
    //TODO: This is a temporary means of extracting the session id
    return document.location.pathname.match(/.*\/(.*)\/.*/)[1];
  })();

  $scope.onItemLoaded = function(data) {
    $scope.allData = data;
    $scope.item = data.item;
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
    controller
  ]);