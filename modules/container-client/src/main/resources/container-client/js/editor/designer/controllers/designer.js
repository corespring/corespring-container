/* global AddContentModalController */
var controller = function($scope, $compile, $http, $timeout, $modal, $log, DesignerService, PlayerService, MathJaxService, ComponentToWiggiwizFeatureAdapter) {

  $scope.showComponentsPanel = false;

  // TODO: find last id from markup
  $scope.lastId = 10;

  var configPanels = {};

  $scope.editorMode = "visual";

  $scope.onComponentsLoaded = function(componentSet) {

    $scope.componentSet = componentSet;

    $scope.extraFeatures = [
      {
        name: 'external',
        type: 'dropdown',
        dropdownTitle: 'Components',
        buttons: _.map(componentSet, function(c) {
          return ComponentToWiggiwizFeatureAdapter.componentToWiggiwizFeature(c, $scope);
        })
      }
    ];

  };

  $scope.hasComponents = function() {
    return $scope.item && _.size($scope.item.components) > 0;
  };

  $scope.isNewItem = function() {
    return $scope.item && !$scope.hasComponents();
  };

  $scope.onComponentsLoadError = function(error) {
    console.warn("Error loading components");
  };

  $scope.getUploadUrl = function(file) {
    console.log(arguments);
    return file.name;
  };

  $scope.selectFile = function(file) {
    console.log("root select file...");
    $scope.selectedFile = file;
    console.log($scope.selectedFile);
  };

  $scope.$on('fileSizeGreaterThanMax', function(event) {
    console.warn("file too big");
  });

  $scope.getQuestionForComponentId = function(id) {
    return $scope.item.components[id];
  };

  $scope.$on('registerConfigPanel', function(a, id, component) {
    console.log("registerConfigPanel:", id, component);
    configPanels[id] = component;
    component.setModel($scope.item.components[id]);
  });

  $scope.save = function() {
    console.log("Saving: ");
    console.log($scope.item.components);
    var cleaned = $scope.serialize($scope.item.components);
    console.log(cleaned);
    DesignerService.save($scope.itemId, cleaned, $scope.onItemSaved, $scope.onItemSaveError, $scope.itemId);
  };

  $scope.serialize = function(comps) {
    if (!configPanels) {
      return comps;
    }

    var newModel = _.cloneDeep(comps);
    _.each(comps, function(value, key) {
      var component = configPanels[key];
      if (component && component.getModel) {
        comps[key] = component.getModel();
      }
    });

    return newModel;
  };


  $scope.$on('mathJaxUpdateRequest', function() {
    MathJaxService.parseDomForMath();
  });

  $scope.getItem = function() {
    return $scope.item;
  };

  PlayerService.setQuestionLookup($scope.getQuestionForComponentId);
  PlayerService.setItemLookup($scope.getItem);

  $scope.$on('itemLoaded', function(ev, item) {
    _.each(item.components, function(c, key) {
      var serverLogic = corespring.server.logic(c.componentType);
      if (serverLogic.preprocess) {
        //TODO: This is part of a larger task to add preprocess to the container
        //@see: https://thesib.atlassian.net/browse/CA-842
        item.components[key] = serverLogic.preprocess(c);
      }
    });

    $scope.item = item;

    var scoringJs = _.find($scope.item.files, function(f) {
      return f.name === "scoring.js";
    });

    if (scoringJs) {
      PlayerService.setScoringJs(scoringJs);
    }
  });

  DesignerService.loadAvailableComponents($scope.onComponentsLoaded, $scope.onComponentsLoadError);
};

angular.module('corespring-editor.controllers')
  .controller('Designer', ['$scope',
    '$compile',
    '$http',
    '$timeout',
    '$modal',
    '$log',
    'DesignerService',
    'PlayerService',
    'MathJaxService',
    'ComponentToWiggiwizFeatureAdapter',
    controller
  ]);