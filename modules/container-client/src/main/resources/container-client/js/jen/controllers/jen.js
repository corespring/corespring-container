var controller = function ($location, $log, $scope) {

  function createToggle( property, initialValue ){
    $scope[property] = initialValue;
    return function(){
      $scope[property] = $scope[property] ? "" : "hidden";
    }
  }

  $scope.toggleNav = createToggle("navColumnHidden", "");
  $scope.togglePreview = createToggle("previewColumnHidden", "hidden");

  $scope.navEntries = [
    {
      title: "Design",
      path: "/design",
      active: "active"
    },
    {
      title: "View Player",
      path: "/view-player",
      active: ""
    },
    {
      title: "Item Profile",
      path: "/item-profile",
      active: ""
    },
    {
      title: "Supporting Materials",
      path: "/supporting-materials",
      active: ""
    },
    {
      title: "Overview",
      path: "/overview",
      active: ""
    }
  ];

  $scope.currentNavEntry = $scope.navEntries[0];

  $scope.chooseNavEntry = function(path) {
    $log.debug("!! chooseNavEntry -> ", path);
    _.forEach($scope.navEntries, function(entry){
      entry.active = "";
    });
    var newCurrent = _.find($scope.navEntries, function(entry){return entry.path === path;}) || $scope.navEntries[0];
    $scope.currentNavEntry = newCurrent;
    $scope.currentNavEntry.active = "active";
    $location.path($scope.currentNavEntry.path);
  };

  $scope.$on('$locationChangeSuccess', function(){
    $scope.chooseNavEntry( $location.path() );
  });

  $scope.chooseNavEntry( $location.path() );

};

angular.module('corespring-jen.controllers')
  .controller('JenCtrl',
    ['$location',
     '$log',
     '$scope',
    controller]);

