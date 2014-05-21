var controller = function($scope, $sce) {
  $scope.url = $sce.trustAsResourceUrl('../../item/' + $scope.itemId + '/new-preview');
};

angular.module('corespring-editor.controllers')
  .controller('Overview', ['$scope',
    '$sce',
    controller
  ]);