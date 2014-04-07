/* global AddContentModalController, com */
var controller = function(
  $scope,
  $compile,
  $http,
  $timeout,
  $modal,
  $log,
  DesignerService,
  PlayerService,
  MathJaxService,
  ComponentToWiggiwizFeatureAdapter,
  ImageUtils) {

  var configPanels = {};

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
          $log.debug('done: ', body, status);
          onComplete(null, url);
        },
        onUploadProgress: function() {
          $log.debug('progress', arguments);
          onProgress(null, 'started');
        },
        onUploadFailed: function() {
          $log.debug('failed', arguments);
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
      var id = ++$scope.lastId;
      $scope.item.components[id] = _.cloneDeep(component.defaultData);
      addContent($('<placeholder id="' + id + '" label="' + component.name + '">'));
    };

    var componentToFeature = function(component) {
      return ComponentToWiggiwizFeatureAdapter.componentToWiggiwizFeature(component, addToEditor);
    };

    $scope.extraFeatures = [{
      name: 'external',
      type: 'dropdown',
      dropdownTitle: 'Components',
      buttons: _.map(componentSet, componentToFeature)
    }];
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

    var max = 0;
    $(item.xhtml).find('[id]').each(function(idx, element) {
      var id = Number($(element).attr('id'));
      if (!_.isNaN(id) && id > max) {
        max = id;
      }
    });
    $scope.lastId = max;

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
    'ImageUtils',
    controller
  ]);