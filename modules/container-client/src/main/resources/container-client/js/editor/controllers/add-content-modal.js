var AddContentModalController = function ($scope, $modalInstance, componentSet) {
  $scope.componentSet = componentSet;

  $scope.addComponentMap = {};
  _.each(componentSet, function (comp) {
    $scope.addComponentMap[comp.name] = {amount: 1, include: false};
  });

  var rows = [];
  for (var i = 0; i < componentSet.length; i++) {
    if (i % 4 === 0) rows.push([]);
    rows[rows.length - 1].push(componentSet[i]);
  }
  $scope.componentSetGrid = rows;

  $scope.ok = function (component) {
    _.each($scope.addComponentMap, function (comp, compKey) {
      if (comp.include) {
        $scope.addComponentMap[compKey] = {amount: comp.amount, component: _.find($scope.componentSet, function (setComp) {
          return setComp.name == compKey;
        })};
      } else {
        delete $scope.addComponentMap[compKey];
      }
    });
    $modalInstance.close($scope.addComponentMap);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

AddContentModalController.$inject = ['$scope', '$modalInstance', 'componentSet'];
