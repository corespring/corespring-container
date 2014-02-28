var controller = function ($scope, $log, $location, ItemService, DataQueryService) {

 
  $scope.itemId = (function(){
    //TODO: This is a temporary means of extracting the session id
    return document.location.pathname.match(/.*\/(.*)\/.*/)[1];
  })();

  $scope.tabs = [
    {
      title: "Profile",
      path: "/profile",
      active: true
    },
    {
      title: "Designer",
      path: "/designer",
      active: false 
    },
     {
      title: "Supporting Materials",
      path: "/supporting-materials",
      active: false 
    }
  ];

  $scope.choose = function(t) {

    $log.debug("!! choose -> ", t);
    _.forEach($scope.tabs, function(t){
      t.active = false;
    });
    $scope.currentTab = t;
    $scope.currentTab.active = true;
    $log.debug("!! choose -> ", $scope.tabs);

    $location.path($scope.currentTab.path);
  };

  $scope.onItemLoaded = function (data) {
    $scope.allData = data;
    $log.debug("item loaded: " + $scope.allData);
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
      'ItemService',
      'DataQueryService',
      controller]);
