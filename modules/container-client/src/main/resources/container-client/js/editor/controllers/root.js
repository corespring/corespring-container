var controller = function($scope, $log, $location, DataQueryService, ItemService, NavModelService) {

  var previewable = [
    '/design',
    '/item-profile'
  ];

  var search = $location.search();
  $scope.showLeftNav = search.leftnav === true || search.leftnav === 'true';
  $scope.showPreview = search.preview === true || search.preview === 'true';

  $scope.toggleLeftNav = function(updateLocation) {
    //updateLocation = updateLocation || true;
    $scope.showLeftNav = !$scope.showLeftNav;
    $location.search('leftnav', $scope.showLeftNav);
  };

  $scope.togglePreview = function() {
    $scope.showPreview = !$scope.showPreview;
    $location.search('preview', $scope.showPreview);
  };

  $scope.nav = NavModelService;

  $scope.$on('$locationChangeSuccess', function() {
    NavModelService.chooseNavEntry($location.path());

    if (_.contains(previewable, $location.path())) {
      $scope.showPreview = true;
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
    'DataQueryService',
    'ItemService',
    'NavModelService',
    controller
  ]);