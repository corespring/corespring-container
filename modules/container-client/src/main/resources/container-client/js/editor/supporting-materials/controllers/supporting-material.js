/* global AddContentModalController, com */
var controller = function(
  $scope,
  $http,
  $stateParams,
  $state,
  $log,
  $filter,
  SupportingMaterialsService,
  ItemService,
  ImageUtils) {

  $scope.index = parseInt($stateParams.index, 10);
  $scope.editing = false;

  $scope.imageService = {

    deleteFile: function(url) {
      $http['delete'](url);
    },

    addFile: function(file, onComplete, onProgress) {
      var url = supportingMaterials()[$scope.index].name + '/' + file.name;

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

  $scope.onSaveSuccess = function() {
    $scope.data.saveInProgress = false;
  };

  $scope.onSaveError = function() {
    $scope.data.saveInProgress = false;
  };

  $scope.$watch('supportingMarkup', function(newValue) {
    if ($scope.data.item) {
      var updatedSupportingMaterials = $scope.data.item.supportingMaterials;
      var supportingMaterialFile = SupportingMaterialsService.getSupportingMaterial(supportingMaterials(), $scope.index);
      if (supportingMaterialFile) {
        supportingMaterialFile.content = newValue;
        var fileIndex = _.findIndex(supportingMaterials()[$scope.index].files, function(file) {
          return file.isMain;
        });
        updatedSupportingMaterials[$scope.index].files[fileIndex] = supportingMaterialFile;
        $scope.data.item.supportingMaterials = updatedSupportingMaterials;
      }
    }
  });

  $scope.$on('save-data', function() {
    $scope.save();
  });

  $scope.save = function() {
    ItemService.save({ supportingMaterials: $scope.data.item.supportingMaterials }, $scope.onSaveSuccess,
      $scope.onSaveError, $scope.itemId);
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


  function supportingMaterials() {
    return $scope.data.item ? $scope.data.item.supportingMaterials : undefined;
  }

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
    if (supportingMaterials()) {
      return SupportingMaterialsService.getSupportingMaterial(supportingMaterials(), $scope.index).content;
    } else {
      return undefined;
    }
  };

  function getSupportingMaterialType() {
    return supportingMaterials() ? supportingMaterials()[$scope.index].materialType : undefined;
  }

  $scope.toggleEdit = function() {
    $scope.editing = !$scope.editing;
  };

  $scope.delete = function() {
    if (window.confirm("Are you sure?")) {
      $scope.data.item.supportingMaterials.splice($scope.index, 1);
      if ($scope.index > 0) {
        $state.transitionTo('supporting-material', {index: $scope.index - 1});
      } else {
        $state.transitionTo('supporting-materials');
      }
    }
  };

  $scope.isContentType = function(contentType) {
    return supportingMaterials() ? contentType === SupportingMaterialsService.getContentType(supportingMaterials(), $scope.index) : false;
  };

  function getSupportingMaterial() {
    var supportingMaterial;
    if (supportingMaterials()) {
      supportingMaterial = SupportingMaterialsService.getSupportingMaterial(supportingMaterials(), $scope.index);
      SupportingMaterialsService.getKBFileSize(supportingMaterials(), $scope.index, function(size) {
        $scope.supportingMaterialFileSize = size;
      });
    }
    return supportingMaterial;
  }

  $scope.$on('itemLoaded', function() {
    $scope.supportingMaterial = getSupportingMaterial();
    $scope.supportingMarkup = $scope.getSupportingMaterialMarkup();
    $scope.materialType = getSupportingMaterialType();
  });

  $scope.supportingMaterial = getSupportingMaterial();
  $scope.supportingMarkup = $scope.getSupportingMaterialMarkup();
  $scope.materialType = getSupportingMaterialType();

};

angular.module('corespring-editor.controllers')
  .controller('SupportingMaterial', ['$scope',
    '$http',
    '$stateParams',
    '$state',
    '$log',
    '$filter',
    'SupportingMaterialsService',
    'ItemService',
    'ImageUtils',
    controller
  ]);