/* global com */
var controller = function($scope, ItemService, $modal, Overlay, $state, $log) {

  var log = $log.debug.bind($log, '[supporting-materials] -');

  var otherType = 'Other';

  $scope.materialTypes = ['Rubric', 'Student Work', otherType];
  $scope.materialType = $scope.materialTypes[0];

  $scope.displayOther = isOther();
  $scope.$watch('materialType', function() {
    $scope.displayOther = isOther();
  });

  $scope.uploadType = null;

  function isOther() {
    return $scope.materialType === otherType;
  }

  function getType() {
    return isOther() ? $scope.textMaterialType : $scope.materialType;
  }

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

  function createSupportingMaterial(callback) {
    function handleText() {
      callback({
        name: $scope.title,
        materialType: getType(),
        files: [{
          "name": "index.html",
          "contentType": "text/html",
          "content": $scope.content,
          "isMain": true
        }]
      });
    }

    function handleFile() {
      var reader = new FileReader();
      var file = $('.new-supporting-material input[type=file]')[0].files[0];
      var url = $scope.title + '/' + file.name;

      var opts = {
        onUploadComplete: function(body, status) {
          log('done: ', body, status);
          callback({
            name: $scope.title,
            materialType: getType(),
            files: [{
              "name": file.name,
              "contentType": "application/pdf",
              "storageKey": $scope.itemId + "/" + $scope.title + "/" + file.name,
              "isMain": true
            }]
          });
        }
      };

      reader.onloadend = function() {
        var uploader = new com.ee.RawFileUploader(file, reader.result, url, name, opts);
        uploader.beginUpload();
      };

      reader.readAsBinaryString(file);
    }

    if (uploadTypeIs('text')) {
      return handleText();
    } else if (uploadTypeIs('file')) {
      return handleFile();
    } else {
      log.error("Undefined upload type");
    }
  }

  $scope.create = function(data) {
    var supportingMaterials;
    if (_.isEmpty(getType())) {
      window.alert("Please select a type for the supporting material.");
    } else if (_.isEmpty($scope.title)) {
      window.alert("Please enter a title for the supporting material.");
    } else {
      if ($scope.data.item) {
        supportingMaterials = $scope.data.item.supportingMaterials || [];
        createSupportingMaterial(function(newSupportingMaterial) {
          supportingMaterials.push(newSupportingMaterial);
          ItemService.save({
              supportingMaterials: supportingMaterials
            }, $scope.onSaveSuccess, $scope.onSaveError,
            $scope.itemId);
        });
      } else {
        log.error("Need $scope.item initialized");
      }
    }
  };

  $scope.createNew();

};

angular.module('corespring-editor.controllers')
  .controller('SupportingMaterials', ['$scope',
    'ItemService',
    '$modal',
    'Overlay',
    '$state',
    '$log',
    controller
  ]);