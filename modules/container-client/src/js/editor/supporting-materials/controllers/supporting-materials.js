/* global AddContentModalController, com */

angular.module('corespring-editor.controllers')
  .controller('SupportingMaterials', [
    '$filter',
    '$http',
    '$q',
    '$modal',
    '$log',
    '$scope',
    '$state',
    '$stateParams',
    'ImageUtils',
    'ItemService',
    'SupportingMaterialsService',
    'EditorConfig',
    '$timeout',
    '$element',
    'debounce',
    function(
      $filter,
      $http,
      $q,
      $modal,
      $log,
      $scope,
      $state,
      $stateParams,
      ImageUtils,
      ItemService,
      SupportingMaterialsService,
      EditorConfig,
      $timeout,
      $element,
      debounce){

      $scope.index = parseInt($stateParams.index, 10);
      $scope.editing = false;

      // Dropdowns in wiggi-wiz toolbar don't trigger when bootstrap is imported?
      $timeout(function() {
        $('.wiggi-wiz-toolbar button', $element).dropdown();
      });

      $scope.addNew = function() {
        var modalInstance = $modal.open({
          templateUrl: '/templates/popups/addSupportingMaterial',
          controller: 'AddSupportingMaterialPopupController',
          backdrop: 'static'
        });

        modalInstance.result.then(function(supportingMaterial) {
          $scope.createText(supportingMaterial);
        });
      };

      $scope.deleteSupportingMaterial = function(index, ev) {
        $scope.$emit('deleteSupportingMaterial', {
          index: index
        });
        ev.preventDefault();
        ev.stopPropagation();
      };

      var saveSupportingMaterials = debounce(function(){
        ItemService.saveSupportingMaterials($scope.item.supportingMaterials);
      });

      $scope.$watch('item.supportingMaterials', function(newValue, oldValue) {
        if (newValue) {
          updateSupportingMaterialsList($scope.item);
        }

        if (oldValue !== newValue) {
          saveSupportingMaterials();
          if (oldValue) {
            $scope.$emit('itemChanged', {partChanged: 'supportingMaterials'});
          }
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

      $scope.$on('itemLoaded', function() {
        $scope.init();
      });

      $scope.extraFeatures = {
        definitions: [
          EditorConfig.mathJaxFeatureGroup(),
          EditorConfig.footnotesFeatureGroup()
        ]
      };

      $scope.overrideFeatures = EditorConfig.overrideFeatures;

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
        $scope.supportingMaterials = SupportingMaterialsService.getSupportingMaterialsByGroups(item.supportingMaterials);
      };

      $scope.onNewSupportingMaterialSaveSuccess = function(data) {
        $scope.item.supportingMaterials = data.supportingMaterials;
        var idx = $scope.getSupportingMaterials().length - 1;
        $state.transitionTo('supporting-materials', {
          index: idx
        }, {
          reload: true
        });
      };

      $scope.onSaveSuccess = function(data) {};

      $scope.onSaveError = function() {};

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
          var supportingMaterial = {
            name: newMaterial.name,
            materialType: newMaterial.materialType,
            files: []
          };
          var supportingMaterials = $scope.item.supportingMaterials || [];
          supportingMaterials.push(supportingMaterial);

          var deferred = $q.defer();

          ItemService.saveSupportingMaterials( supportingMaterials, 
            function(result) {
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
              deferred.resolve({
                filename: fileToUpload.name,
                data: data
              });
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
          supportingMaterial.files = [{
            "name": filename,
            "contentType": "application/pdf",
            "storageKey": $scope.itemId + "/" + supportingMaterial.id + "/" + filename,
            "isMain": true
          }];
          data.supportingMaterials[data.supportingMaterials.length - 1] = supportingMaterial;
          ItemService.saveSupportingMaterials(data.supportingMaterials,
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
          files: [{
            "_t": "org.corespring.platform.core.models.item.resource.VirtualFile",
            "name": "index.html",
            "contentType": "text/html",
            "content": $scope.content,
            "isMain": true
          }]
        };
        
        supportingMaterials.push(newSupportingMaterial);
        
        ItemService.saveSupportingMaterials(  
          supportingMaterials,
          $scope.onNewSupportingMaterialSaveSuccess, 
          $scope.onSaveError);
      };

      $scope.init();

    }
  ]);