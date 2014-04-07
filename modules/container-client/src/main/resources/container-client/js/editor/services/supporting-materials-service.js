(function() {
  function SupportingMaterialsService($sce, $http) {

    var self = this;

    function getUrl(item, index) {
      return item.supportingMaterials[index].name + "/" + self.getSupportingMaterial(item, index).name;
    }

    this.getSupportingMaterial = function(item, index) {
      if (item) {
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
      $http({method: 'GET', url: getUrl(item, index)}).success(function(data, status, headers) {
        callback(headers('content-length') / 1024);
      });
    };

    this.getSupportingUrl = function(item, index) {
      return $sce.trustAsResourceUrl(getUrl(item, index));
    };

    function isContentType(options) {
      var supportingMaterial = self.getSupportingMaterial(options.item, options.index);
      return (options.contentType && supportingMaterial) ?
        supportingMaterial.contentType === options.contentType : false;
    }

    this.getContentType = function(item, index) {
      return self.getSupportingMaterial(item, index).contentType;
    };

    function isMarkup(item, index) {
      isContentType({
        item: item,
        index: index,
        contentType: 'text/html'
      });
    }

    function isPdf(item, index) {
      isContentType({
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


