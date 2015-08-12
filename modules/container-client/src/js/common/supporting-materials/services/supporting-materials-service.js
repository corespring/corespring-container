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

        this.saveHtml = function(materialName, filename, markup){
          var call = Urls.saveContent;

          var url = addQueryParamsIfPresent(call.url
           .replace(':name', materialName)
           .replace(':filename', filename));

          $http[call.method](url, {content: markup, name: filename});
        };

        this.getBinaryUrl = function(m, file){
          return addQueryParamsIfPresent(Urls.getAsset.url
            .replace(':name', m.name)
            .replace(':filename', file.name));
        };

        this.getAssetUrl = function(name, materialName) {
          return this.getBinaryUrl({name: materialName}, {name: name});
        };
        
        this.deleteAsset = function(name, materialName) {
          var call = Urls.deleteAsset;
          var url = addQueryParamsIfPresent(call.url.replace(':name', materialName).replace(':filename', name));
          $http[call.method](url);
        };

        this.addAsset = function(file, materialName, onComplete, onProgress){
          var call = Urls.addAsset;
          var url = addQueryParamsIfPresent(call.url.replace(':name', materialName));
          MultipartFileUploader.upload(url, file, {}, function(update){
            console.log('success: ', update);
            onComplete(null, file.name);
          }, function(err){
            console.error(err);
          });
        };

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

        this.delete = function(m, onSuccess, onFailure){
          var call = Urls.delete;
          var url = addQueryParamsIfPresent(call.url);
          url = url.replace(':name', m.name);

          logger.debug('url: ', url);
          
          $http[call.method](url)
            .success(onSuccess)
            .error(onFailure);
        };
      }

      return new SupportingMaterialsService();
    }
  ]);