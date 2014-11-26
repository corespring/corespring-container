(function() {
  function SupportingMaterialsService($sce, $http) {

    var self = this;

    function getUrl(supportingMaterials, index) {
      if (supportingMaterials) {
        var material = supportingMaterials[index];
        return (material.id || material.name)+ "/" + self.getSupportingMaterialFile(supportingMaterials, index).name;
      } else {
        return undefined;
      }
    }

    function lengthInUtf8Bytes(str) {
      var m;
      if (str) {
        // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
        m = encodeURIComponent(str).match(/%[89ABab]/g);
        return str.length + (m ? m.length : 0);
      } else {
        return 0;
      }
    }

    this.isDefault = function(file) {
      return file['default']; //TODO ie8 doesn't like default, change to isMain?
    };

    this.validateMetadata = function(metadata, log) {
      log = log || function() {};
      if (_.isEmpty(metadata.title)) {
        log("Please enter a title for the supporting material.");
        return false;
      } else if (_.isEmpty(metadata.materialType)) {
        log("Please select a type for the supporting material.");
        return false;
      } else {
        return true;
      }
    };

    this.getSupportingMaterialFile = function(supportingMaterials, index) {
      if (supportingMaterials && supportingMaterials[index]) {
        var fileIndex = _.findIndex(supportingMaterials[index].files, this.isDefault);
        return supportingMaterials[index].files[fileIndex];
      } else {
        return undefined;
      }
    };

    /**
     * Returns the file size of the supporting material for item at index in KB to the provided callback.
     */
    this.getKBFileSize = function(supportingMaterials, index, callback) {
      var url;
      var supportingMaterial;
      if (supportingMaterials) {
        supportingMaterial = self.getSupportingMaterialFile(supportingMaterials, index);
        if (supportingMaterial && supportingMaterial.contentType === 'text/html') {
          callback(lengthInUtf8Bytes(supportingMaterial.content) / 1024);
        } else {
          url = getUrl(supportingMaterials, index);
          $http({
            method: 'GET',
            url: url
          }).success(function(data, status, headers) {
            callback(headers('content-length') / 1024);
          });
        }
      } else {
        callback(undefined);
      }
    };

    this.getSupportingUrl = function(supportingMaterials, index) {
      return $sce.trustAsResourceUrl(getUrl(supportingMaterials, index));
    };

    this.getContentType = function(supportingMaterials, index) {
      return self.getSupportingMaterialFile(supportingMaterials, index).contentType;
    };

    /**
     * Return true if we should display a preview for the supporting material.
     */
    this.previewable = function(supportingMaterials, index) {
      return true;
    };

    function isContentType(supportingMaterials, index, contentType) {
      var supportingMaterial = self.getSupportingMaterial(supportingMaterials, index);
      return (supportingMaterial && contentType) ?
        supportingMaterial.contentType === contentType : false;
    }

  }

  angular.module('corespring-common.supporting-materials.services')
    .service('SupportingMaterialsService', [
      '$sce',
      '$http',
      SupportingMaterialsService
    ]);

})();