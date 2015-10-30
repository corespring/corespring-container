angular.module('corespring-common.supporting-materials.services')
  .service('SupportingMaterialsService', [
    '$http',
    'MultipartFileUploader',
    'LogFactory',
    'SupportingMaterialUrls',
    'SmUtils',
    function($http, MultipartFileUploader, LogFactory, Urls, SmUtils) {

      var logger = LogFactory.getLogger('supporting-materials-service');

      function SupportingMaterialsService() {

        function addParams(url){
          return SmUtils.addQueryParamsIfPresent(url);
        }

        this.updateContent = function(materialName, filename, content, onSuccess, onFailure){
          var call = Urls.updateContent;

          var url = addParams(call.url
           .replace(':name', materialName)
           .replace(':filename', filename));

          var req = {
            method: call.method.toUpperCase(),
            url: url,
            headers: {
             'Content-Type': 'text/plain; charset=utf-8' 
            },
            data: content
          };

          $http(req)
            .success(onSuccess)
            .error(onFailure);
        };

        this.getBinaryUrl = function(m, file){
          return SmUtils.getBinaryUrl(m, file);
        };

        this.getAssetUrl = function(materialName, name) {
          return this.getBinaryUrl({name: materialName}, {name: name});
        };
        
        this.deleteAsset = function(materialName, name) {
          var call = Urls.deleteAsset;
          var url = addParams(call.url.replace(':name', materialName).replace(':filename', name));
          $http[call.method](url);
        };

        this.addAsset = function(materialName, file, onComplete, onProgress){
          var call = Urls.addAsset;
          var url = addParams(call.url.replace(':name', materialName));
          MultipartFileUploader.upload(url, file, {}, function(update){
            onComplete(null, file.name);
          }, function(err){
            onComplete(err);
          });
        };

        this.create = function(m, onSuccess, onFailure) {
          if (m.file) {
            uploadFile(m, onSuccess, onFailure);
          } else {
            var c = Urls.create;
            var url = addParams(c.url);
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
          url = addParams(url);

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
          var url = addParams(call.url);
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