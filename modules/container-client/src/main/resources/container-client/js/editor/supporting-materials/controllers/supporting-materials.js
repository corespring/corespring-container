/* global com */
var controller = function($scope, ItemService, SupportingMaterialsService, $modal, Overlay, $state, $log) {

  var log = $log.debug.bind($log, '[supporting-materials] -');

  $scope.uploadType = null;
  $scope.newMaterial = {};

  $scope.createNew = function() {

    $scope.overrides = [{
      name: 'image',
      iconclass: 'fa fa-picture-o',
      action: function() {
        window.alert('You must save the supporting material before adding images.');
      }
    }];

    Overlay.open({
      template: $('#new-supporting-material-modal').html(),
      target: $('.supporting-materials'),
      scope: $scope,
      customToolbar: {}
    });

    // TODO: Remove this workaround if/when overlay works officially outsize wiggiwiz
    $('#overlay-holder').appendTo($('.supporting-materials'));
  };

  $scope.onSaveSuccess = function(result) {
    $scope.data.item.supportingMaterials = result.supportingMaterials;
    $state.transitionTo('supporting-material', {
      index: result.supportingMaterials.length - 1
    });
  };

  $scope.onSaveError = function(result) {
    $log.error(result);
  };

  $scope.triggerUploadDialog = function() {
    $('.new-supporting-material input[type=file]').trigger('click');
  };

  function uploadTypeIs(str) {
    return $scope.uploadType === str;
  }

  function createSupportingMaterial() {

    function handleText() {
      var supportingMaterials = $scope.data.item.supportingMaterials || [];
      var newSupportingMaterial = {
        name: $scope.newMaterial.name,
        materialType: $scope.newMaterial.materialType,
        files: [{
          "name": "index.html",
          "contentType": "text/html",
          "content": $scope.content,
          "isMain": true
        }]
      };
      supportingMaterials.push(newSupportingMaterial);
      ItemService.save({ supportingMaterials: supportingMaterials }, $scope.onSaveSuccess, $scope.onSaveError,
        $scope.itemId);
    }

    function handleFile() {
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
        var supportingMaterials = $scope.data.item.supportingMaterials || [];
        supportingMaterials.push({ name: $scope.newMaterial.title, materialType: $scope.newMaterial.materialType });
        console.log('about to save...');
        ItemService.save(
          { supportingMaterials: supportingMaterials },
          callback,
          $scope.onSaveError,
          $scope.itemId
        );
      }

      /**
       * Given an item and a callback, uploads a file to that item, executing the provided callback when finished.
       */
      function uploadFile(data, callback) {
        var supportingMaterial = getNewestSupportingMaterial(data);
        var reader = new FileReader();
        var file = $('.new-supporting-material input[type=file]')[0].files[0];
        var url = supportingMaterial.id + '/' + file.name;

        var opts = {
          onUploadComplete: function(body, status) {
            log('done: ', body, status);
            callback(file.name, data);
          }
        };

        reader.onloadend = function() {
          var uploader = new com.ee.RawFileUploader(file, reader.result, url, name, opts);
          uploader.beginUpload();
        };

        reader.readAsBinaryString(file);
      }

      /**
       * Adds the provided filename adds the filename as the sole file for the most recent supporting material in the
       * provided data.
       */
      function updateWithFileData(filename, data) {
        var supportingMaterial = getNewestSupportingMaterial(data);
        supportingMaterial.files = [{
          "name": filename,
          "contentType": "application/pdf",
          "storageKey": $scope.itemId + "/" + supportingMaterial.id + "/" + filename,
          "isMain": true
        }];
        data.supportingMaterials[data.supportingMaterials.length - 1] = supportingMaterial;
        ItemService.save({
            supportingMaterials: data.supportingMaterials
          },
          $scope.onSaveSuccess,
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
        uploadFile(result, function(filename, data) {
          updateWithFileData(filename, data);
        });
      });

    }

    if (uploadTypeIs('text')) {
      return handleText();
    } else if (uploadTypeIs('file')) {
      return handleFile();
    } else {
      log.error("Undefined upload type");
    }
  }

  $scope.create = function() {
    if ($scope.data.item &&
      SupportingMaterialsService.validateMetadata({ title: $scope.newMaterial.name, materialType: $scope.newMaterial.materialType })) {
      createSupportingMaterial();
    }
  };

  $scope.createNew();

};

angular.module('corespring-editor.controllers')
  .controller('SupportingMaterials', ['$scope',
    'ItemService',
    'SupportingMaterialsService',
    '$modal',
    'Overlay',
    '$state',
    '$log',
    controller
  ]);