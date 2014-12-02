/* global AddContentModalController, com */
var controller = function($element, $filter, $http, $location, $q, $modal, $log, $rootScope, $scope, $state, $stateParams, ImageUtils, ItemService, SupportingMaterialsService, WiggiFootnotesFeatureDef, WiggiMathJaxFeatureDef, WiggiLinkFeatureDef) {

  $scope.index = parseInt($stateParams.index, 10);
  $scope.editing = false;

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

        var uploadScope = $scope.$new();
        uploadScope.progress = "0";

        var uploadModal = $modal.open({
          templateUrl: '/templates/popups/uploadingSupportingMaterial',
          backdrop: 'static',
          scope: uploadScope
        });

        var onProgress = function(progress) {
          uploadScope.progress = progress;
          uploadScope.$apply();
        };

        var onFinished = function() {
          uploadModal.dismiss();
        };

        var onError = function(error) {
          uploadModal.dismiss();
          window.alert('There was an error uploading the Supporting Material');
        };

        $scope.createFile(supportingMaterial, onProgress, onFinished, onError);
      }
    });
  };

  $scope.deleteSupportingMaterial = function(index, ev) {
    $scope.$emit('deleteSupportingMaterial', {
      index: index
    });
    ev.preventDefault();
    ev.stopPropagation();
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

  $scope.$watch('supportingMarkup', function(newValue) {
    if ($scope.item) {
      var updatedSupportingMaterials = $scope.item.supportingMaterials;
      var supportingMaterialFile = SupportingMaterialsService.getSupportingMaterialFile($scope.getSupportingMaterials(), $scope.index);
      if (supportingMaterialFile) {
        supportingMaterialFile.content = newValue;
        var fileIndex = _.findIndex($scope.getSupportingMaterials()[$scope.index].files, SupportingMaterialsService.isDefault);
        updatedSupportingMaterials[$scope.index].files[fileIndex] = supportingMaterialFile;
        $scope.item.supportingMaterials = updatedSupportingMaterials;
      }
    }
  });

  $scope.$on('fileSizeGreaterThanMax', function(event) {
    console.warn("file too big");
  });

  $scope.$on('save-data', function() {
    $scope.save();
  });

  $scope.$on('itemLoaded', function() {
    $scope.init();
  });

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

  $scope.onNewSupportingMaterialSaveSuccess = function(data) {
    $scope.item.supportingMaterials = data.supportingMaterials;
    var idx = $scope.getSupportingMaterials().length - 1;
    $state.transitionTo('supporting-materials', { index: idx }, { reload: true });
  };

  $scope.onSaveSuccess = function(data) {
  };

  $scope.onSaveError = function() {
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
    return ($scope.item && !_.isEmpty($scope.item.supportingMaterials)) ? $scope.item.supportingMaterials : undefined;
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

  $scope.isContentType = function(contentType) {
    if ($scope.getSupportingMaterials() && $scope.index >= $scope.getSupportingMaterials().length) {
      return;
    }
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

  $scope.init = function() {
    if (!$scope.item || !$scope.item.supportingMaterials || $scope.index >= $scope.item.supportingMaterials.length) {
      return;
    }
    $scope.supportingMaterial = getSupportingMaterial();
    $scope.supportingMaterialFile = getSupportingMaterialFile();
    $scope.supportingMarkup = $scope.getSupportingMaterialMarkup();
    $scope.materialType = getSupportingMaterialType();
  };

  $scope.createFile = function(newMaterial, onProgress, onFinished, onError) {
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
      var supportingMaterials = $scope.item.supportingMaterials || [];
      supportingMaterials.push(supportingMaterial);

      var deferred = $q.defer();

      ItemService.save({supportingMaterials: supportingMaterials}, function(result) {
          deferred.resolve(result);
        },
        function(error) {
          deferred.reject(error);
        });

      return deferred.promise;

    }

    /**
     * Given an item and a callback, uploads a file to that item, executing the provided callback when finished.
     */
    function uploadFile(fileToUpload, data) {
      var deferred = $q.defer();

      var supportingMaterial = getNewestSupportingMaterial(data);
      var reader = new FileReader();
      var url = supportingMaterial.id + '/' + fileToUpload.name;

      var opts = {
        onUploadComplete: function(body, status) {
          deferred.resolve({filename: fileToUpload.name, data: data});
        },
        onUploadFailed: function(error) {
          deferred.reject(error);
        },
        onUploadProgress: function(event) {
          if (_.isFunction(onProgress)) {
            onProgress((event.loaded * 100 / event.total).toFixed(2));
          }
        }
      };

      reader.onloadend = function() {
        var uploader = new com.ee.RawFileUploader(fileToUpload, reader.result, url, name, opts);
        uploader.beginUpload();
      };

      reader.readAsBinaryString(fileToUpload);

      return deferred.promise;
    }

    /**
     * Adds the provided filename adds the filename as the sole file for the most recent supporting material in the
     * provided data.
     */
    function updateWithFileData(filename, data) {
      var deferred = $q.defer();
      var supportingMaterial = getNewestSupportingMaterial(data);
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
        function(data) {
          deferred.resolve(data);
        },
        function(error) {
          deferred.reject(error);
        }
      );

      return deferred.promise;
    }

    /**
     * Important set of steps:
     *   1. Persist the initial supporting material's name and type, returning an id.
     *   2. Using the id, upload the supporting material file to a subdirectory matching the id.
     *   3. Update the supporting material data with a reference to the file uploaded in the previous step.
     */
    persistInitial().then(function(result) {
      return uploadFile(newMaterial.fileToUpload, result);
    }).then(function(result) {
      return updateWithFileData(result.filename, result.data);
    }).then(function(result) {
      $scope.onNewSupportingMaterialSaveSuccess(result);
      if (_.isFunction(onFinished)) {
        onFinished();
      }
    }).catch(function(error) {
      if (_.isFunction(onError)) {
        onError(error);
      }
      // Remove the newly added supporting material if upload is unsuccessful
      $scope.item.supportingMaterials = _.initial($scope.item.supportingMaterials);
    });
  };

  $scope.createText = function(newMaterial) {
    var supportingMaterials = $scope.item.supportingMaterials || [];
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
    '$q',
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
