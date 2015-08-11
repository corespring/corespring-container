(function() {
  function SupportingMaterialsService($sce, $http) {

    var self = this;

    function getUrl(supportingMaterials, index) {
      if (supportingMaterials) {
        var material = supportingMaterials[index];
        var file = self.getSupportingMaterialFile(supportingMaterials, index);
        if (file) {
          return 'materials/' + material.name + '/' + file.name;
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    }

    function getName(supportingMaterials, index) {
      if (supportingMaterials) {
        var material = supportingMaterials[index];
        var file = self.getSupportingMaterialFile(supportingMaterials, index);
        if (file) {
          return material.name;
        } else {
          return undefined;
        }
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
      return file && file.isMain;
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

    this.getSupportingName = function(supportingMaterials,index){
      return $sce.trustAsResourceUrl(getName(supportingMaterials, index));
    };


    this.getContentType = function(supportingMaterials, index) {
      var file = self.getSupportingMaterialFile(supportingMaterials, index);
      return file ? file.contentType : undefined;
    };

    this.getContent = function(supportingMaterials, index) {
      var file = self.getSupportingMaterialFile(supportingMaterials, index);
      return file ? file.content : undefined;
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

    this.getSupportingMaterialsByGroups = function(supportingMaterials) {
      var groupedSupportingMaterials = _.groupBy(supportingMaterials, "materialType");
      var result = [];
      var insertSupportingMaterialsForType = function(supMat) {
        var index = _.indexOf(supportingMaterials, supMat);
        result.push({label: supMat.name, type: "data", index: index});
      };
      for (var key in groupedSupportingMaterials) {
        if (key !== "undefined") {
          result.push({label: key, type: "header"});
        }
        _.each(groupedSupportingMaterials[key], insertSupportingMaterialsForType);
        result.push({type: "divider"});
      }
      return _.initial(result);
    };

  }

  angular.module('corespring-common.supporting-materials.services')
    .service('OldSupportingMaterialsService', [
      '$sce',
      '$http',
      SupportingMaterialsService
    ]);

})();