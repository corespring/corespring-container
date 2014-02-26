var controller = function ($scope, $log, $location) {

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
};

angular.module('corespring-editor.controllers')
  .controller('Root',
    ['$scope',
      '$log',
      '$location',
      controller]);
