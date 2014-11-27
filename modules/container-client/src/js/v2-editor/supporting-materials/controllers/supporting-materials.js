/* global AddContentModalController, com */
var controller = function($element, $filter, $http, $location, $modal, $log, $rootScope, $scope, $state, $stateParams, ImageUtils, ItemService, SupportingMaterialsService, WiggiFootnotesFeatureDef, WiggiMathJaxFeatureDef, WiggiLinkFeatureDef) {

  $scope.index = parseInt($stateParams.index, 10);
  $scope.editing = false;

  var updateSupportingMaterialsList = function(item) {
    var groupedSupportingMaterials = _.groupBy(item.supportingMaterials, "materialType");
    $scope.supportingMaterials = [];
    var insertSupportingMaterialsForType = function(supMat) {
      var index = _.indexOf(item.supportingMaterials, supMat);
      $scope.supportingMaterials.push({label: supMat.name, type: "data", index: index});
    };
    for (var key in groupedSupportingMaterials) {
      if (key !== "undefined") {
        $scope.supportingMaterials.push({label: key, type: "header"});
      }
      _.each(groupedSupportingMaterials[key], insertSupportingMaterialsForType);
      $scope.supportingMaterials.push({type: "divider"});
    }
    $scope.supportingMaterials = _.initial($scope.supportingMaterials);
  };

  $scope.$watch('item.supportingMaterials', function(newValue, oldValue) {
    if (newValue) {
      updateSupportingMaterialsList($scope.item);
    }

    if (oldValue !== newValue) {
      ItemService.fineGrainedSave({'supportingMaterials': $scope.item.supportingMaterials}, function(result) {
      });
    }
  }, true);

  $scope.extraFeatures = {
    definitions: [
      {
        type: 'group',
        buttons: [new WiggiMathJaxFeatureDef()]
      },
      {
        type: 'group',
        buttons: [
          new WiggiFootnotesFeatureDef()
        ]
      }
    ]
  };

  $scope.imageService = {

    deleteFile: function(url) {
      $http['delete'](url);
    },

    addFile: function(file, onComplete, onProgress) {
      var url = $scope.getSupportingMaterials()[$scope.index].id + '/' + file.name;

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

  $scope.onNewSupportingMaterialSaveSuccess = function(data) {
    console.log("saved: ", data);
    $scope.data.saveInProgress = false;
    $scope.data.item.supportingMaterials = data.supportingMaterials;
    var idx = $scope.getSupportingMaterials().length - 1;
    $state.transitionTo('supporting-materials', { index: idx }, { reload: true });
  };

  $scope.onSaveSuccess = function(data) {
    $scope.data.saveInProgress = false;
  };

  $scope.onSaveError = function() {
    $scope.data.saveInProgress = false;
  };

  $scope.$watch('supportingMarkup', function(newValue) {
    if ($scope.data && $scope.data.item) {
      var updatedSupportingMaterials = $scope.data.item.supportingMaterials;
      var supportingMaterialFile = SupportingMaterialsService.getSupportingMaterialFile($scope.getSupportingMaterials(), $scope.index);
      if (supportingMaterialFile) {
        supportingMaterialFile.content = newValue;
        var fileIndex = _.findIndex($scope.getSupportingMaterials()[$scope.index].files, SupportingMaterialsService.isDefault);
        updatedSupportingMaterials[$scope.index].files[fileIndex] = supportingMaterialFile;
        $scope.data.item.supportingMaterials = updatedSupportingMaterials;
      }
    }
  });

  $scope.$on('save-data', function() {
    $scope.save();
  });

  $scope.addNew = function() {
    $state.transitionTo('supporting-materials', {
      intro: false
    });
  };

  $scope.formatKB = function(kb, decimalPlaces) {
    var mb;
    if (isNaN(kb)) {
      return "--";
    } else {
      decimalPlaces = decimalPlaces || 2;
      if (kb < 1024) {
        return Math.round(kb * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces) + "kb";
      } else {
        mb = kb / 1024;
        return Math.round(mb * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces) + "mb";
      }
    }
  };

  $scope.getSupportingMaterials = function() {
    return ($scope.data && $scope.data.item && !_.isEmpty($scope.data.item.supportingMaterials)) ? $scope.data.item.supportingMaterials : undefined;
  };

  $scope.formatDate = function(date) {
    if (date instanceof Object && date.$date) {
      date = date.$date;
    }
    return $filter('date')(date, 'medium');
  };

  $scope.hasDate = function(supportingMaterial) {
    return supportingMaterial && supportingMaterial.dateModified !== undefined;
  };

  $scope.getSupportingMaterialMarkup = function() {
    if ($scope.getSupportingMaterials()) {
      return SupportingMaterialsService.getSupportingMaterialFile($scope.getSupportingMaterials(), $scope.index).content;
    } else {
      return undefined;
    }
  };

  function getSupportingMaterialType() {
    return $scope.getSupportingMaterials() ? $scope.getSupportingMaterials()[$scope.index].materialType : undefined;
  }

  $scope.toggleEdit = function() {
    $scope.editing = !$scope.editing;
  };

  $scope.delete = function() {
    $scope.$emit('deleteSupportingMaterial', {
      index: $scope.index
    });
  };

  $scope.isContentType = function(contentType) {
    return $scope.getSupportingMaterials() ?
      contentType === SupportingMaterialsService.getContentType($scope.getSupportingMaterials(), $scope.index) : false;
  };

  function getSupportingMaterial() {
    return $scope.getSupportingMaterials() ? $scope.getSupportingMaterials()[$scope.index] : undefined;
  }

  function getSupportingMaterialFile() {
    var supportingMaterial;
    if ($scope.getSupportingMaterials()) {
      supportingMaterial = SupportingMaterialsService.getSupportingMaterialFile($scope.getSupportingMaterials(), $scope.index);
      SupportingMaterialsService.getKBFileSize($scope.getSupportingMaterials(), $scope.index, function(size) {
        $scope.supportingMaterialFileSize = size;
      });
    }
    return supportingMaterial;
  }

  $scope.getSupportingUrl = function() {
    return SupportingMaterialsService.getSupportingUrl($scope.getSupportingMaterials(), $scope.index);
  };

  $scope.$on('itemLoaded', function() {
    $scope.init();
  });

  $scope.deleteSupportingMaterial = function(index) {
    $scope.$emit('deleteSupportingMaterial', {
      index: index
    });
  };

  $scope.addNew = function() {
    var modalInstance = $modal.open({
      templateUrl: '/templates/popups/addSupportingMaterial',
      controller: 'AddSupportingMaterialPopupController',
      backdrop: 'static'
    });

    modalInstance.result.then(function(supportingMaterial) {
      if (supportingMaterial.method === 'createHtml') {
        $scope.createText(supportingMaterial);
      } else {
        $scope.createFile(supportingMaterial);
      }
    });
  };


  $scope.init = function() {
    $scope.supportingMaterial = getSupportingMaterial();
    $scope.supportingMaterialFile = getSupportingMaterialFile();
    $scope.supportingMarkup = $scope.getSupportingMaterialMarkup();
    $scope.materialType = getSupportingMaterialType();
  };

  $scope.createFile = function(newMaterial) {
    function getNewestSupportingMaterial(data) {
      var supportingMaterial;
      if (data.supportingMaterials) {
        supportingMaterial = _.last(data.supportingMaterials);
        if (supportingMaterial && supportingMaterial.id) {
          return supportingMaterial;
        } else {
          throw new Error("Supporing material did not contain an id.");
        }
      } else {
        throw new Error("Response did not contain supporting materials.");
      }
    }

    /**
     * Persists the name and material type of a supporting material, yielding the fully saved item to a callback
     * function.
     */
    function persistInitial(callback) {
      var supportingMaterial = { name: newMaterial.name, materialType: newMaterial.materialType, files: [] };
      var supportingMaterials = $scope.data.item.supportingMaterials || [];
      supportingMaterials.push(supportingMaterial);
      ItemService.save({supportingMaterials: supportingMaterials}, callback, $scope.onSaveError);
    }

    /**
     * Given an item and a callback, uploads a file to that item, executing the provided callback when finished.
     */
    function uploadFile(fileToUpload, data, callback, errorCallback) {
      console.log("uploading file ", fileToUpload, " data ", data);
      var supportingMaterial = getNewestSupportingMaterial(data);
      var reader = new FileReader();
      var url = supportingMaterial.id + '/' + fileToUpload.name;

      var opts = {
        onUploadComplete: function(body, status) {
          console.log("Upload COmplete");
          callback(fileToUpload.name, data);
        },
        onUploadFailed: function(a,b) {
          console.log("Upload Failed");
          errorCallback();
        }
      };

      reader.onloadend = function() {
        var uploader = new com.ee.RawFileUploader(fileToUpload, reader.result, url, name, opts);
        uploader.beginUpload();
      };

      reader.readAsBinaryString(fileToUpload);
    }

    /**
     * Adds the provided filename adds the filename as the sole file for the most recent supporting material in the
     * provided data.
     */
    function updateWithFileData(filename, data) {
      var supportingMaterial = getNewestSupportingMaterial(data);
      console.log("Updating SM With data", supportingMaterial, filename);
      supportingMaterial.files = [
        {
          "name": filename,
          "contentType": "application/pdf",
          "storageKey": $scope.itemId + "/" + supportingMaterial.id + "/" + filename,
          "default": true
        }
      ];
      data.supportingMaterials[data.supportingMaterials.length - 1] = supportingMaterial;
      ItemService.save({
          supportingMaterials: data.supportingMaterials
        },
        $scope.onNewSupportingMaterialSaveSuccess,
        $scope.onSaveError,
        $scope.itemId
      );
    }

    /**
     * Important set of steps:
     *   1. Persist the initial supporting material's name and type, returning an id.
     *   2. Using the id, upload the supporting material file to a subdirectory matching the id.
     *   3. Update the supporting material data with a reference to the file uploaded in the previous step.
     */
    persistInitial(function(result) {
      uploadFile(newMaterial.fileToUpload, result, function(filename, data) {
        updateWithFileData(filename, data);
      }, function() {
        alert("error uploading");
      });
    });
  };

  $scope.createText = function(newMaterial) {
    var supportingMaterials = $scope.data.item.supportingMaterials || [];
    var newSupportingMaterial = {
      name: newMaterial.name,
      materialType: newMaterial.materialType,
      files: [
        {
          "_t": "org.corespring.platform.core.models.item.resource.VirtualFile",
          "name": "index.html",
          "contentType": "text/html",
          "content": $scope.content,
          "default": true
        }
      ]
    };
    supportingMaterials.push(newSupportingMaterial);
    ItemService.save({supportingMaterials: supportingMaterials}, $scope.onNewSupportingMaterialSaveSuccess, $scope.onSaveError);
  };

  $scope.init();

};

angular.module('corespring-editor.controllers')
  .controller('SupportingMaterials', [
    '$element',
    '$filter',
    '$http',
    '$location',
    '$modal',
    '$log',
    '$rootScope',
    '$scope',
    '$state',
    '$stateParams',
    'ImageUtils',
    'ItemService',
    'SupportingMaterialsService',
    'WiggiFootnotesFeatureDef',
    'WiggiMathJaxFeatureDef',
    'WiggiLinkFeatureDef',
    controller
  ]);
