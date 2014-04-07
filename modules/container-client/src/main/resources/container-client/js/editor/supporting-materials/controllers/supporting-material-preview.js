/* global AddContentModalController, com */
var controller = function(
  $scope, $stateParams, SupportingMaterialsService) {

  $scope.index = parseInt($stateParams.index, 10);

  $scope.getSupportingUrl = function(index) {
    if ($scope.item) {
      return SupportingMaterialsService.getSupportingUrl($scope.item, index);
    }
  };

  $scope.supportingUrl = $scope.getSupportingUrl($scope.index);
  $scope.$on('itemLoaded', function() {
    $scope.supportingUrl = $scope.getSupportingUrl($scope.index);
  });

};

angular.module('corespring-editor.controllers')
  .controller('SupportingMaterialPreview', ['$scope',
    '$stateParams',
    'SupportingMaterialsService',
    controller
  ]);