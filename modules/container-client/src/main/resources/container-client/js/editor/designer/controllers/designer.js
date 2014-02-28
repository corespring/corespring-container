/* global AddContentModalController */
var controller = function (
  $scope, $compile, $http, $timeout, $modal, $log,
  DesignerService, PlayerService, MathJaxService, ComponentRegister) {

  $scope.showComponentsPanel = false;

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
    return $scope.item && _.size($scope.item.components) > 0;
  };

  $scope.isNewItem = function(){
    return $scope.item && !$scope.hasComponents();
  };

  $scope.onComponentsLoadError = function (error) {
    console.warn("Error loading components");
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
    $scope.item.components[uid] = _.cloneDeep(descriptor.defaultData);
    var node = $($scope.item.xhtml);
    node.append("<" + descriptor.componentType + " id='" + uid + "'></" + descriptor.componentType + ">");
    $scope.item.xhtml = "<div>" + node.html() + "</div>";

    if (!$scope.selectedComponent) {
      $scope.selectedComponent = {id: uid, component: $scope.item.components[uid]};
    }
  };

  $scope.$on('fileSizeGreaterThanMax', function (event) {
    console.warn("file too big");
  });

  $scope.getQuestionForComponentId = function (id) {
    return $scope.item.components[id];
  };

  $scope.registerConfigPanel = function (id, component) {
    console.log("registerConfigPanel:", id);
    configPanels[id] = component;
    component.setModel($scope.item.components[id]);
  };

  $scope.save = function () {
    console.log("Saving: ");
    console.log($scope.item.components);
    var cleaned = $scope.serialize($scope.item.components);
    console.log(cleaned);
    DesignerService.save($scope.itemId, cleaned, $scope.onItemSaved, $scope.onItemSaveError, $scope.itemId);
  };

  $scope.serialize = function (comps) {

    if (!configPanels){ return comps;}

    var newModel = _.cloneDeep(comps);
    _.each(comps, function (value, key) {
      var component = configPanels[key];
      if (component && component.getModel) {
        comps[key] = component.getModel();
      }
    });
    return comps;
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
    return $scope.item;
  };

  PlayerService.setQuestionLookup($scope.getQuestionForComponentId);
  PlayerService.setItemLookup($scope.getItem);

  function initDesigner(item){

    _.each(item.components, function(c, key) {
      var serverLogic = corespring.server.logic(c.componentType);
      if (serverLogic.preprocess) {
        //TODO: This is part of a larger task to add preprocess to the container
        //@see: https://thesib.atlassian.net/browse/CA-842
        item.components[key] = serverLogic.preprocess(c);
      }
    });

    $scope.item = item;

    for (var c in item.components) {
      $scope.selectedComponent = {id: c, component: item.components[c]};
      break;
    }

    var scoringJs = _.find($scope.item.files, function (f) {
      return f.name === "scoring.js";
    });

    if (scoringJs) {
      PlayerService.setScoringJs(scoringJs);
    }
  }

  DesignerService.loadItem($scope.itemId, function(item){
    initDesigner(item);
  });

  DesignerService.loadAvailableComponents($scope.onComponentsLoaded, $scope.onComponentsLoadError);
};

angular.module('corespring-editor.controllers')
  .controller('Designer',
    ['$scope',
      '$compile',
      '$http',
      '$timeout',
      '$modal',
      '$log',
      'DesignerService',
      'PlayerService',
      'MathJaxService',
      'ComponentRegister',
      controller]);
