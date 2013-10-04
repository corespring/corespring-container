var controller = function ($scope, $compile, $http, $timeout, EditorServices, CorespringContainer) {

  $scope.save = function () {
    //TODO: updateItem - get the update ready
    EditorServices.save(updatedItem, $scope.onItemSaved, $scope.onItemSaveError);
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
    $scope.model = data;
    CorespringContainer.initialize(data);
  };

  EditorServices.load($scope.onItemLoaded, $scope.onItemLoadError);
};

angular.module('corespring-editor.controllers').controller('Root', ['$scope', '$compile', '$http', '$timeout', 'EditorServices', 'CorespringContainer', controller]);
