var controller = function ($scope) {

  function createToggle( property ){
    return function(){
      $scope[property] = $scope[property] ? "" : "hidden";
    }
  }

  $scope.navColumnHidden = "";
  $scope.toggleNav = createToggle("navColumnHidden");

  $scope.previewColumnHidden = "hidden";
  $scope.togglePreview = createToggle("previewColumnHidden");

};

angular.module('corespring-jen.controllers')
  .controller('JenCtrl',
    ['$scope',
    controller]);

