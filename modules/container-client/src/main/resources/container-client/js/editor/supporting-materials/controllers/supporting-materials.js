var controller = function ($scope, ItemService, $modal, Overlay, $state, $log) {

  var log = $log.debug.bind($log, '[supporting-materials] -');

  $scope.uploadType = null;

  $scope.$watch('uploadType', function() {
    console.log($scope.uploadType);
  });

  $scope.createNew = function() {

    $scope.featuresWithoutImage = [{
      name: 'no-image',
      type: 'group',
      buttons: [{
        name: 'image',
        iconclass: 'fa fa-picture-o',
        action: function() {
          window.alert('You must save the supporting material before adding images.');
        }
      }]
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

  $scope.confirm = function() {
    var confirmationModal = $modal.open({
      template: $('#save-supporting-material-modal').html(),
      windowClass: 'save-supporting-material-window',
      scope: $scope,
      controller: ['$scope','$modalInstance', function($scope, $modalInstance) {

        var otherType = 'Other';
        function isOther() { return $scope.data.materialType === otherType; }
        function getType() { return isOther() ? $scope.data.textMaterialType : $scope.data.materialType; }

        $scope.materialTypes = ['Rubric', 'Student Work', otherType];
        $scope.data = {
          materialType: $scope.materialType ?
            (($scope.materialTypes.indexOf($scope.materialType) > 0) ? $scope.materialType : otherType) :
            $scope.materialTypes[0],
          title: $scope.title,
          textMaterialType: ($scope.materialTypes.indexOf($scope.materialType) > 0) ? '' : $scope.materialType
        };
        $scope.displayOther = isOther();

        $scope.$watch('data.materialType', function() { $scope.displayOther = isOther(); });

        $scope.ok = function() {
          if ($scope.data.title !== undefined && $scope.data.title !== "") {
            $modalInstance.close({ materialType: getType(), title: $scope.data.title });
          } else {
            window.alert("Please enter a title for the supporting material.");
          }
        };

        $scope.cancel = function() {
          $modalInstance.dismiss('cancel');
        };

        setTimeout(function() { $('#supporting-material-title').focus(); }, 200);
      }],
      resolve: {
        materialType: function() { return $scope.materialType; },
        title: function() { return $scope.title; }
      }
    });

    confirmationModal.result.then(function(data) {
      data.content = $scope.content;
      $scope.create(data);
    });
  };

  $scope.onSaveSuccess = function(result) {
    $scope.data.item.supportingMaterials = result.supportingMaterials;
    $state.transitionTo('supporting-material', {index: result.supportingMaterials.length - 1});
  };

  $scope.onSaveError = function(result) {
    $log.error(result);
  };

  $scope.triggerUploadDialog = function() {
    $('.new-supporting-material input[type=file]').trigger('click');
  }

  function uploadTypeIs(str) {
    return $scope.uploadType === str;
  }

  function createSupportingMaterial(data, callback) {
    function handleText() {
      callback({
        name: data.title,
        materialType: data.materialType,
        files: [
          {
            "name": "index.html",
            "contentType": "text/html",
            "content": data.content,
            "isMain": true
          }
        ]
      });
    }

    function handleFile() {
      var reader = new FileReader();
      var file = $('.new-supporting-material input[type=file]')[0].files[0];
      var url = data.title + '/' + file.name;

      var opts = {
        onUploadComplete: function(body, status) {
          log('done: ', body, status);
          callback({
            name: data.title,
            materialType: data.materialType,
            files: [
              {
                "name": file.name,
                "contentType": "application/pdf",
                "storageKey": $scope.itemId + "/" + data.title + "/" + file.name,
                "isMain": true
              }
            ]
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
    if ($scope.data.item) {
      supportingMaterials = $scope.data.item.supportingMaterials || [];
      createSupportingMaterial(data, function(newSupportingMaterial) {
        supportingMaterials.push(newSupportingMaterial);
        ItemService.save({ supportingMaterials: supportingMaterials }, $scope.onSaveSuccess, $scope.onSaveError,
          $scope.itemId);
      });
    } else {
      log.error("Need $scope.item initialized");
    }
  };

  $scope.createNew();

};

angular.module('corespring-editor.controllers')
  .controller('SupportingMaterials',
    ['$scope',
     'ItemService',
     '$modal',
     'Overlay',
     '$state',
     '$log',
      controller]);
