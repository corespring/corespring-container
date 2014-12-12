var controller = function($scope, $sce) {
  $scope.url = $sce.trustAsResourceUrl('../../item/' + $scope.itemId + '/preview');
};

angular.module('corespring-v1-editor.controllers')
  .controller('Overview', ['$scope',
    '$sce',
    controller
  ]);