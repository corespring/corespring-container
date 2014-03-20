var controller = function ($scope, $log, $location, DataQueryService, ItemService, NavModelService) {

  function createToggle( property, initialValue ){
    $scope[property] = !!initialValue ? 'collapsed' : '';
    return function(){
      $scope[property] = $scope[property] ? "" : "collapsed";
    };
  }

  $scope.toggleNav = createToggle("navContainerCollapsed", false);
  $scope.togglePreview = createToggle("previewContainerCollapsed", true);

  $scope.nav = NavModelService;

  $scope.$on('$locationChangeSuccess', function(){
    NavModelService.chooseNavEntry( $location.path() );
  });

  NavModelService.chooseNavEntry( $location.path() );

  $scope.itemId = (function(){
    //TODO: This is a temporary means of extracting the session id
    return document.location.pathname.match(/.*\/(.*)\/.*/)[1];
  })();

  $scope.onItemLoaded = function (data) {
    $scope.allData = data;
    $scope.item = data.item;
  };

  $scope.onItemLoadError = function (error) {
    $log.warn("Error loading item", error);
  };

  $scope.onItemSaved = function (data) {
  };

  $scope.onItemSaveError = function (error) {
    console.warn("Error saving item");
  };


  DataQueryService.list("gradeLevel", function(result){
    $scope.gradeLevelDataProvider = result;
  });

  DataQueryService.list("itemType", function(result){
    $scope.itemTypeDataProvider  = result;
    $scope.itemTypeValues =  _.chain($scope.itemTypeDataProvider)
                      .pluck("value")
                      .flatten()
                      .value();

  });

  ItemService.load($scope.onItemLoaded, $scope.onItemLoadError, $scope.itemId);
};

angular.module('corespring-editor.controllers')
  .controller('Root',
    ['$scope',
      '$log',
      '$location',
      'DataQueryService',
      'ItemService',
      'NavModelService',
      controller]);
