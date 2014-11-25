/* global AddContentModalController, com */
var controller = function($element, $filter, $http, $location, $log, $rootScope, $scope, $state, $stateParams, ImageUtils, ItemService, SupportingMaterialsService, WiggiFootnotesFeatureDef, WiggiMathJaxFeatureDef, WiggiLinkFeatureDef) {

  $scope.index = parseInt($stateParams.index, 10);
  $scope.editing = false;

  var createSupportingMaterialsDropDown = function(item) {
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

  $scope.$watchCollection('item.supportingMaterials', function(n) {
    if (n) {
      createSupportingMaterialsDropDown($scope.item);
    }
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
      },
      {
        type: 'group',
        buttons: [
          new WiggiLinkFeatureDef()
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

  $scope.onSaveSuccess = function(data) {
    $rootScope.onItemLoaded(data);
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

  $scope.save = function() {
    ItemService.save({
        supportingMaterials: $scope.data.item.supportingMaterials
      }, $scope.onSaveSuccess,
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


  $scope.getSupportingMaterials = function() {
    return ($scope.data && $scope.data.item) ? $scope.data.item.supportingMaterials : undefined;
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

  $scope.updateMetadata = function(name, materialType) {
    if ($scope.data && $scope.data.item) {
      console.log("updating metadata",name,materialType);
      var updatedSupportingMaterials = $scope.data.item.supportingMaterials;
      var supportingMaterial = $scope.getSupportingMaterials()[$scope.index];
      if (supportingMaterial) {
        supportingMaterial.name = name;
        supportingMaterial.materialType = materialType;
        updatedSupportingMaterials[$scope.index] = supportingMaterial;
        $scope.data.item.supportingMaterials = updatedSupportingMaterials;
      }
    }
  };


  $scope.init = function() {
    console.log("showing supmat ", $scope.index);
    $scope.supportingMaterial = getSupportingMaterial();
    $scope.supportingMaterialFile = getSupportingMaterialFile();
    $scope.supportingMarkup = $scope.getSupportingMaterialMarkup();
    $scope.materialType = getSupportingMaterialType();

    if ($scope.isContentType('text/html')) {
      $scope.$emit('showPreview');
    } else {
      $scope.$emit('hidePreview');
    }

  };

  $scope.init();

};

angular.module('corespring-editor.controllers')
  .controller('SupportingMaterials', [
    '$element',
    '$filter',
    '$http',
    '$location',
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
