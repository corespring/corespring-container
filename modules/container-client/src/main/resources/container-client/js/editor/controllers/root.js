var controller = function ($scope, $compile, $http, $timeout, EditorServices, PlayerServices) {

  var configPanels = {};

  var getUid = function(){
    return Math.random().toString(36).substring(2,9);
  };

  $scope.save = function () {
    console.log("Saving: ");
    console.log($scope.model);
    var cleaned = $scope.serialize($scope.model);
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

    var scoringJs = _.find($scope.model.files, function(f){
      return f.name === "scoring.js";
    });

    if(scoringJs){
      PlayerServices.setScoringJs(scoringJs);
    }
  };

  $scope.getUploadUrl = function(file){
    console.log(arguments);
    return file.name;
    //return "??";
  };

  $scope.selectFile = function(file){
    console.log("root select file...");
    $scope.selectedFile = file;
    $scope.selectedComponent = null;
    console.log($scope.selectedFile);
  };

  $scope.addComponent = function(descriptor) {
    console.log("add component" + descriptor.componentType);
    var uid = getUid();
    $scope.model.components[uid] = _.cloneDeep(descriptor.defaultData);
    var node = $($scope.model.xhtml);
    node.append("<" + descriptor.componentType + " id='" +uid+"'></" + descriptor.componentType + ">");
    $scope.model.xhtml = "<div>" + node.html() + "</div>";
  };

  $scope.$on('fileSizeGreaterThanMax', function(event){
     console.warn("file too big");
  });

  $scope.getQuestionForComponentId = function(id){
    return $scope.model.components[id];
  };


  $scope.registerConfigPanel = function(id, component){
    console.log("registerConfigPanel:", id);
    configPanels[id] = component;
    component.setModel($scope.model.components[id]);
  };

  $scope.serialize = function (itemModel) {

    if (!configPanels) return itemModel;

    var newModel = _.cloneDeep(itemModel);
    _.each(newModel.components, function(value, key) {
      var component = configPanels[key];
      if (component && component.getModel) {
        newModel.components[key] = component.getModel();
      }
    });
    return newModel;
  };


  PlayerServices.setQuestionLookup($scope.getQuestionForComponentId);

  EditorServices.load($scope.onItemLoaded, $scope.onItemLoadError);
  EditorServices.loadComponents($scope.onComponentsLoaded, $scope.onComponentsLoadError);
};

angular.module('corespring-editor.controllers')
  .controller('Root',
    ['$scope',
    '$compile',
    '$http',
    '$timeout',
    'EditorServices',
    'PlayerServices',
    controller]);
