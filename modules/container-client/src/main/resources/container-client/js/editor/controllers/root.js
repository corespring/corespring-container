/* global AddContentModalController */
var controller = function ($scope, $compile, $http, $timeout, $modal, $log, EditorServices, PlayerServices, MathJaxService, ComponentRegister) {

  $scope.showComponentsPanel = false;

  $scope.itemId = (function(){
    //TODO: This is a temporary means of extracting the session id
    return document.location.pathname.match(/.*\/(.*)\/.*/)[1];
  })();

  var configPanels = {};

  var getUid = function () {
    return Math.random().toString(36).substring(2, 9);
  };

  $scope.editorMode = "visual";

  $scope.openChooser = function () {

    var modalInstance = $modal.open({
      templateUrl: 'add-component.html',
      controller: AddContentModalController,
      backdrop: true,
      resolve: {
        componentSet: function () {
          return $scope.componentSet;
        }
      }
    });

    modalInstance.result.then(
      function (componentMap) {
        _.each(componentMap, function (v, k) {
          _(v.amount).times(function () {
            $scope.addComponent(v.component);
          });
        });

      },
      function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
  };

  $scope.save = function () {
    console.log("Saving: ");
    console.log($scope.model);
    var cleaned = $scope.serialize($scope.model);
    console.log(cleaned);
    EditorServices.save(cleaned, $scope.onItemSaved, $scope.onItemSaveError, $scope.itemId);
  };

  $scope.onItemSaved = function (data) {
  };

  $scope.onItemSaveError = function (error) {
    console.warn("Error saving item");
  };

  $scope.onItemLoadError = function (error) {
    console.warn("Error loading item");
  };

  $scope.onComponentsLoaded = function (componentSet) {
    $scope.componentSet = componentSet;
  };

  $scope.getIconUrl = function (type) {
    var comp = _.find($scope.componentSet, function (c) {
      return c.componentType === type;
    });

    if (comp) {
      return comp.icon;
    }
  };

  $scope.hasComponents = function(){
    return $scope.model && _.size($scope.model.components) > 0;
  };

  $scope.isNewItem = function(){
    return $scope.model && !$scope.hasComponents();
  };

  $scope.onComponentsLoadError = function (error) {
    console.warn("Error loading components");
  };

  $scope.onItemLoaded = function (data) {
    _.each(data.item.components, function(c, key) {
      var serverLogic = corespring.server.logic(c.componentType);
      if (serverLogic.render) {
        data.item.components[key] = serverLogic.render(c);
      }
    });

    $scope.rootModel = data;
    $scope.model = data.item;

    for (var c in $scope.model.components) {
      $scope.selectedComponent = {id: c, component: $scope.model.components[c]};
      break;
    }

    var scoringJs = _.find($scope.model.files, function (f) {
      return f.name === "scoring.js";
    });

    if (scoringJs) {
      PlayerServices.setScoringJs(scoringJs);
    }
  };

  $scope.getUploadUrl = function (file) {
    console.log(arguments);
    return file.name;
    //return "??";
  };

  $scope.selectFile = function (file) {
    console.log("root select file...");
    $scope.selectedFile = file;
    $scope.selectedComponent = null;
    console.log($scope.selectedFile);
  };

  $scope.addComponent = function (descriptor) {
    console.log("add component" + descriptor.componentType);
    var uid = getUid();
    $scope.model.components[uid] = _.cloneDeep(descriptor.defaultData);
    var node = $($scope.model.xhtml);
    node.append("<" + descriptor.componentType + " id='" + uid + "'></" + descriptor.componentType + ">");
    $scope.model.xhtml = "<div>" + node.html() + "</div>";

    if (!$scope.selectedComponent) {
      $scope.selectedComponent = {id: uid, component: $scope.model.components[uid]};
    }
  };

  $scope.$on('fileSizeGreaterThanMax', function (event) {
    console.warn("file too big");
  });

  $scope.getQuestionForComponentId = function (id) {
    return $scope.model.components[id];
  };


  $scope.registerConfigPanel = function (id, component) {
    console.log("registerConfigPanel:", id);
    configPanels[id] = component;
    component.setModel($scope.model.components[id]);
  };

  $scope.serialize = function (itemModel) {

    if (!configPanels){ return itemModel;}

    var newModel = _.cloneDeep(itemModel);
    _.each(newModel.components, function (value, key) {
      var component = configPanels[key];
      if (component && component.getModel) {
        newModel.components[key] = component.getModel();
      }
    });
    return newModel;
  };


  $scope.$on('mathJaxUpdateRequest', function () {
    MathJaxService.parseDomForMath();
  });

  $scope.switchToJsonView = function() {
    $scope.selectedComponentJson = JSON.stringify($scope.selectedComponent.component, null, 2);
    $scope.editorMode = 'json';
  };

  $scope.$watch('selectedComponent.id', function (newValue) {
     if (newValue) {
       $scope.selectedComponentJson = JSON.stringify($scope.selectedComponent.component, null, 2);
     }
  });

  $scope.jsonEditorLoaded = function(_editor) {
    var _session = _editor.getSession();
    _session.setUseWrapMode(true);
    _session.setWrapLimitRange(70, 80);
  };


  $scope.jsonEditorChanged = function(val) {
    var newObject = JSON.parse($scope.selectedComponentJson);
    for (var key in $scope.selectedComponent.component) {
      $scope.selectedComponent.component[key] = newObject[key];
    }
  };


  $scope.getItem = function () {
    return $scope.model;
  };

  PlayerServices.setQuestionLookup($scope.getQuestionForComponentId);
  PlayerServices.setItemLookup($scope.getItem);

  EditorServices.load($scope.onItemLoaded, $scope.onItemLoadError, $scope.itemId);
  EditorServices.loadComponents($scope.onComponentsLoaded, $scope.onComponentsLoadError);
};

angular.module('corespring-editor.controllers')
  .controller('Root',
    ['$scope',
      '$compile',
      '$http',
      '$timeout',
      '$modal',
      '$log',
      'EditorServices',
      'PlayerServices',
      'MathJaxService',
      'ComponentRegister',
      controller]);
