(function() {
  function SupportingMaterialsService($sce, $http) {

    var self = this;

    function getUrl(item, index) {
      if (item) {
        return item.supportingMaterials[index].name + "/" + self.getSupportingMaterial(item, index).name;
      } else {
        return undefined;
      }
    }

    this.getSupportingMaterial = function(item, index) {
      if (item && item.supportingMaterials[index]) {
        var fileIndex = _.findIndex(item.supportingMaterials[index].files, function(file) {
          return file.isMain;
        });
        return item.supportingMaterials[index].files[fileIndex];
      } else {
        return undefined;
      }
    };

    /**
     * Returns the file size of the supporting material for item at index in KB to the provided callback.
     */
    this.getKBFileSize = function(item, index, callback) {
      if (item) {
        $http({method: 'GET', url: getUrl(item, index)}).success(function(data, status, headers) {
          callback(headers('content-length') / 1024);
        });
      } else {
        callback(undefined);
      }
    };

    this.getSupportingUrl = function(item, index) {
      return $sce.trustAsResourceUrl(getUrl(item, index));
    };

    function isContentType(options) {
      var supportingMaterial = self.getSupportingMaterial(options.item, options.index);
      return (supportingMaterial && options.contentType) ?
        supportingMaterial.contentType === options.contentType : false;
    }

    this.getContentType = function(item, index) {
      return self.getSupportingMaterial(item, index).contentType;
    };

    function isMarkup(item, index) {
      return isContentType({
        item: item,
        index: index,
        contentType: 'text/html'
      });
    }

    function isPdf(item, index) {
      return isContentType({
        item: item,
        index: index,
        contentType: 'application/pdf'
      });
    }

    /**
     * Return true if we should display a preview for the supporting material.
     */
    this.previewable = function(item, index) {
      return !isMarkup(item, index) && isPdf(item, index);
    };

  }

  angular.module('corespring-editor.services')
    .service('SupportingMaterialsService',
      [
        '$sce',
        '$http',
        SupportingMaterialsService
      ]
    );

})();


