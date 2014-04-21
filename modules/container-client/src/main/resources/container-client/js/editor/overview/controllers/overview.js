var controller = function ($scope, $sce) {
  $scope.url = $sce.trustAsResourceUrl('/client/item/' + $scope.itemId + '/preview');
};

angular.module('corespring-editor.controllers')
  .controller('Overview',
    ['$scope',
     '$sce',
      controller]);
