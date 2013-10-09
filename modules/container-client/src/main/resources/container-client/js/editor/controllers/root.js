var controller = function ($scope, $compile, $http, $timeout, EditorServices, CorespringContainer) {

  $scope.save = function () {
    console.log("Saving: ");
    console.log($scope.model);
    var cleaned = CorespringContainer.serialize($scope.model);
    console.log(cleaned);
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

  $scope.getUploadUrl = function(file){
    console.log(arguments);
    return file.name;
    //return "??";
  };

  $scope.$on('fileSizeGreaterThanMax', function(event){
     console.warn("file too big");
  });

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
