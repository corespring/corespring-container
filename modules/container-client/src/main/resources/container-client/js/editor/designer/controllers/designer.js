/* global AddContentModalController, com */
var controller = function(
  $scope,
  $compile,
  $http,
  $timeout,
  $modal,
  $log,
  $stateParams,
  DesignerService,
  ItemService,
  PlayerService,
  MathJaxService,
  ComponentToWiggiwizFeatureAdapter,
  ImageUtils,
  ComponentRegister,
  WiggiMathJaxFeatureDef) {


  var configPanels = {};

  var log = $log.debug.bind($log, '[designer] - ');


  log($stateParams);
  $scope.section = $stateParams.section;

  $scope.editorMode = "visual";

  $scope.imageService = {

    deleteFile: function(url) {
      $http['delete'](url);
    },
    addFile: function(file, onComplete, onProgress) {
      var url = '' + file.name;

      if (ImageUtils.bytesToKb(file.size) > 500) {
        onComplete(ImageUtils.fileTooBigError(file.size, 500));
        return;
      }

      var opts = {
        onUploadComplete: function(body, status) {
          log('done: ', body, status);
          onComplete(null, url);
        },
        onUploadProgress: function() {
          log('progress', arguments);
          onProgress(null, 'started');
        },
        onUploadFailed: function() {
          log('failed', arguments);
          onComplete({
            code: 'UPLOAD_FAILED',
            message: 'upload failed!'
          });
        }
      };

      var reader = new FileReader();

      reader.onloadend = function() {
        var uploader = new com.ee.RawFileUploader(file, reader.result, url, name, opts);
        uploader.beginUpload();
      };

      reader.readAsBinaryString(file);
    }
  };

  $scope.onComponentsLoaded = function(componentSet) {

    $scope.componentSet = componentSet;

    var addToEditor = function(editor, addContent, component) {
      var max = 0;
      $('<div>' + $scope.data.item.xhtml + '</div>').find('[id]').each(function(idx, element) {
        var id = Number($(element).attr('id'));
        if (!_.isNaN(id) && id > max) {
          max = id;
        }
      });

      var id = max + 1;

      var defaults = {
        weight: 1
      };

      var newData = _.extend(defaults, _.cloneDeep(component.defaultData));

      $scope.data.item.components[id] = newData;

      addContent($('<placeholder id="' + id + '" component-type="' + component.componentType + '" label="' + component.name + '">'));
    };

    var deleteComponent = function(id) {
      if ($scope.data.item && $scope.data.item.components) {
        delete $scope.data.item.components[id];
        ComponentRegister.deleteComponent(id);
      } else {
        throw 'Can\'t delete component with id ' + id;
      }
    };

    var componentToFeature = function(component) {
      return ComponentToWiggiwizFeatureAdapter.componentToWiggiwizFeature(
        component,
        addToEditor,
        deleteComponent);
    };

    var orderList = function(component) {

      var orderedComponents = [
        "corespring-multiple-choice",
        "corespring-inline-choice",
        "corespring-focus-task",
        "corespring-ordering",
        "corespring-drag-and-drop",
        "corespring-text-entry",
        "corespring-extended-text-entry",
        "corespring-point-intercept",
        "corespring-line",
        "corespring-function-entry",
        "corespring-select-text"
      ];


      var idx = _.indexOf(orderedComponents, component.componentType);
      return idx >= 0 ? idx : 1000;
    };

    $scope.extraFeatures = {
      definitions: [{
        name: 'external',
        type: 'dropdown',
        dropdownTitle: 'Answer Type',
        buttons: _.map(_.sortBy(componentSet, orderList), componentToFeature)
      }, {
        type: 'group',
        buttons: [
          new WiggiMathJaxFeatureDef()
        ]
      }]
    };
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
    return $scope.data.item.components[id];
  };

  $scope.$on('registerConfigPanel', function(a, id, component) {
    configPanels[id] = component;
    component.setModel($scope.data.item.components[id]);
  });

  $scope.$on('save-data', function(event) {
    $scope.save();
  });

  $scope.save = function(callback) {
    log('Saving...');
    var cleaned = $scope.serialize($scope.data.item.components);
    ItemService.save({
        components: cleaned,
        xhtml: $scope.data.item.xhtml
      },
      $scope.onItemSaved,
      $scope.onItemSaveError,
      $scope.itemId);
  };

  $scope.serialize = function(comps) {
    if (!configPanels) {
      return comps;
    }

    var newModel = _.cloneDeep(comps);

    _.each(newModel, function(value, key) {
      var component = configPanels[key];
      if (component && component.getModel) {
        newModel[key] = component.getModel();
      }
    });

    return newModel;
  };


  $scope.$on('mathJaxUpdateRequest', function() {
    MathJaxService.parseDomForMath();
  });

  $scope.getItem = function() {
    return $scope.data.item;
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


    var scoringJs = _.find($scope.data.item.files, function(f) {
      return f.name === "scoring.js";
    });

    if (scoringJs) {
      PlayerService.setScoringJs(scoringJs);
    }
  });

  $scope.componentSize = 'none';
  $scope.$watch('data.item.components', function(n) {
    var size = _.size(n);
    if (size > 1) {
      $scope.componentSize = 'many';
    } else if (size === 1) {
      $scope.componentSize = 'one';
    } else {
      $scope.componentSize = 'none';
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
    '$stateParams',
    'DesignerService',
    'ItemService',
    'PlayerService',
    'MathJaxService',
    'ComponentToWiggiwizFeatureAdapter',
    'ImageUtils',
    'ComponentRegister',
    'WiggiMathJaxFeatureDef',
    controller
  ]);