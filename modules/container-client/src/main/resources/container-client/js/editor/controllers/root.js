var controller = function ($scope, $compile, $http, $timeout, EditorServices, CorespringContainer) {

  $scope.save = function () {
    console.log("Saving: ");
    console.log($scope.model);
    CorespringContainer.serialize();
    var cleaned = angular.copy($scope.model);
    EditorServices.save(cleaned, $scope.onItemSaved, $scope.onItemSaveError);
  };

  $scope.onItemSaved = function (data) {
  };

  $scope.onItemSaveError = function (error) {
    console.warn("Error saving item");
  };

  $scope.onItemLoadError = function (error) {
    console.warn("Error loading item");
  };

  $scope.onItemLoaded = function (data) {
    $scope.model = data.item;
    CorespringContainer.initialize(data);
  };


  $scope.selectComponent = function (id) {
    var key, value, _ref, _results;
    _ref = $scope.model.components;
    _results = [];
    for (key in _ref) {
      value = _ref[key];
      if (key === id) {
        $scope.selectedComponent = {
          id: key,
          component: value
        };
        break;
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  EditorServices.load($scope.onItemLoaded, $scope.onItemLoadError);
};

angular.module('corespring-editor.controllers').controller('Root', ['$scope', '$compile', '$http', '$timeout', 'EditorServices', 'CorespringContainer', controller]);
