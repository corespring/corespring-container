var controller = function ($scope) {

  $scope.data = {};
  $scope.gradeLevelDataProvider =  [
      "PK", "KG", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "PS", "AP", "UG"
    ];
};

angular.module('corespring-editor.controllers')
  .controller('Profile',
    ['$scope',
      controller]);
