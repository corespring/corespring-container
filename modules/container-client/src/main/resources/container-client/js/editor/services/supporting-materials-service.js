(function() {
  function SupportingMaterialsService($sce, $http) {

    var self = this;

    function getUrl(supportingMaterials, index) {
      if (supportingMaterials) {
        return supportingMaterials[index].name + "/" + self.getSupportingMaterial(supportingMaterials, index).name;
      } else {
        return undefined;
      }
    }

    this.getSupportingMaterial = function(supportingMaterials, index) {
      if (supportingMaterials && supportingMaterials[index]) {
        var fileIndex = _.findIndex(supportingMaterials[index].files, function(file) {
          return file.isMain;
        });
        return supportingMaterials[index].files[fileIndex];
      } else {
        return undefined;
      }
    };

    /**
     * Returns the file size of the supporting material for item at index in KB to the provided callback.
     */
    this.getKBFileSize = function(supportingMaterials, index, callback) {
      if (supportingMaterials) {
        var url = getUrl(supportingMaterials, index);
        $http({
          method: 'GET',
          url: url
        }).success(function(data, status, headers) {
          callback(headers('content-length') / 1024);
        });
      } else {
        callback(undefined);
      }
    };

    this.getSupportingUrl = function(supportingMaterials, index) {
      return $sce.trustAsResourceUrl(getUrl(supportingMaterials, index));
    };

    this.getContentType = function(supportingMaterials, index) {
      return self.getSupportingMaterial(supportingMaterials, index).contentType;
    };

    /**
     * Return true if we should display a preview for the supporting material.
     */
    this.previewable = function(supportingMaterials, index) {
      var isType = isContentType.bind(this, supportingMaterials, index);
      return !isType('text/html') && isType('application/pdf');
    };

    function isContentType(supportingMaterials, index, contentType) {
      var supportingMaterial = self.getSupportingMaterial(supportingMaterials, index);
      return (supportingMaterial && contentType) ?
        supportingMaterial.contentType === contentType : false;
    }

  }

  angular.module('corespring-editor.services')
    .service('SupportingMaterialsService', [
      '$sce',
      '$http',
      SupportingMaterialsService
    ]);

})();