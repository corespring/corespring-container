angular.module('corespring-common.supporting-materials.services')
  .service('SupportingMaterialsService', [
    '$http',
    '$document',
    'MultipartFileUploader',
    'LogFactory',
    'SupportingMaterialUrls',
    function($http, $document, MultipartFileUploader, LogFactory, Urls) {

      var logger = LogFactory.getLogger('supporting-materials-service');

      function SupportingMaterialsService() {

        function addQueryParamsIfPresent(path) {
          var href = $document[0].location.href;
          return path + (href.indexOf('?') === -1 ? '' : '?' + href.split('?')[1]);
        }

        this.create = function(m, onSuccess, onFailure) {
          if (m.file) {
            uploadFile(m, onSuccess, onFailure);
          } else {
            var c = Urls.create;
            var url = addQueryParamsIfPresent(c.url);
            m.html = '<div>' + m.name + '</div>';
            $http[c.method](url, m)
              .success(onSuccess)
              .error(onFailure || function() {
                logger.error(arguments);
              });
          }
        };

        function uploadFile(m, onSuccess, onFailure) {
          var url = Urls.createFromFile.url;
          url = addQueryParamsIfPresent(url);

          MultipartFileUploader.upload(url, m.file, {
            name: m.name,
            materialType: m.materialType
          }, function(newMaterial) {
            onSuccess(newMaterial);
          }, function(err) {
            logger.error(err);
            onFailure(err);
          });
        }

      }

      return new SupportingMaterialsService();
    }
  ]);