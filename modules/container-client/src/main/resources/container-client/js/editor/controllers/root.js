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

  $scope.onComponentsLoaded = function(componentSet){
    $scope.componentSet = componentSet;
  };

  $scope.onComponentsLoadError = function(error){
    console.warn("Error loading components");
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

  EditorServices.load($scope.onItemLoaded, $scope.onItemLoadError);
  EditorServices.loadComponents($scope.onComponentsLoaded, $scope.onComponentsLoadError);
};

angular.module('corespring-editor.controllers').controller('Root', ['$scope', '$compile', '$http', '$timeout', 'EditorServices', 'CorespringContainer', controller]);
