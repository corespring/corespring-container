/* global AddContentModalController, com */
var controller = function(
  $scope,
  $http,
  $stateParams,
  $log,
  $filter,
  SupportingMaterialsService,
  ImageUtils) {

  $scope.index = parseInt($stateParams.index, 10);

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

  $scope.formatDate = function(date) {
    if (date instanceof Object && date.$date  ) {
      date = date.$date;
    }
    return $filter('date')(date, 'medium');
  };

  $scope.hasDate = function(supportingMaterial) {
    return supportingMaterial && supportingMaterial.dateModified !== undefined;
  };

  $scope.getSupportingMaterialMarkup = function() {
    if ($scope.item) {
      return SupportingMaterialsService.getSupportingMaterial($scope.item, $scope.index).content;
    } else {
      return undefined;
    }
  };

  $scope.isContentType = function(contentType) {
    return ($scope.item) ? contentType === SupportingMaterialsService.getContentType($scope.item, $scope.index) : false;
  };

  function getSupportingMaterial() {
    var supportingMaterial;
    if ($scope.item) {
      supportingMaterial = SupportingMaterialsService.getSupportingMaterial($scope.item, $scope.index);
      SupportingMaterialsService.getKBFileSize($scope.item, $scope.index, function(size) {
        supportingMaterial.fileSize = size;
      });
    }
    return supportingMaterial;
  }

  $scope.$on('itemLoaded', function() {
    $scope.supportingMaterial = getSupportingMaterial();
    $scope.supportingMarkup = $scope.getSupportingMaterialMarkup();
  });

  $scope.supportingMaterial = getSupportingMaterial();
  $scope.supportingMarkup = $scope.getSupportingMaterialMarkup();

};

angular.module('corespring-editor.controllers')
  .controller('SupportingMaterial', ['$scope',
    '$http',
    '$stateParams',
    '$log',
    '$filter',
    'SupportingMaterialsService',
    'ImageUtils',
    controller
  ]);