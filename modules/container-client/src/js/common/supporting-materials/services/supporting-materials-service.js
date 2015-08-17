angular.module('corespring-common.supporting-materials.services')
  .service('SupportingMaterialsService', [
    '$http',
    '$document',
    'MultipartFileUploader',
    'LogFactory',
    'SupportingMaterialUrls',
    'SmUtils',
    function($http, $document, MultipartFileUploader, LogFactory, Urls, Utils) {

      var logger = LogFactory.getLogger('supporting-materials-service');

      function SupportingMaterialsService() {

        this.updateContent = function(materialName, filename, content, onSuccess, onFailure){
          var call = Urls.updateContent;

          var url = Utils.addQueryParamsIfPresent(call.url
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

        this.getFileSizeInKB = function(m, file, success, error){

          var url =  this.getBinaryUrl(m, file);

          $http.get(url)
            .success(function(data, status, headers){
              success(headers('content-length')/1024);
            })
            .error(function(err){
              logger.warn(err);
              error();
            });
        };

        this.getBinaryUrl = function(m, file){
          return Utils.getBinaryUrl(m, file);
        };

        this.getAssetUrl = function(name, materialName) {
          return this.getBinaryUrl({name: materialName}, {name: name});
        };
        
        this.deleteAsset = function(name, materialName) {
          var call = Urls.deleteAsset;
          var url = Utils.addQueryParamsIfPresent(call.url.replace(':name', materialName).replace(':filename', name));
          $http[call.method](url);
        };

        this.addAsset = function(file, materialName, onComplete, onProgress){
          var call = Urls.addAsset;
          var url = Utils.addQueryParamsIfPresent(call.url.replace(':name', materialName));
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
            var url = Utils.addQueryParamsIfPresent(c.url);
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
          url = Utils.addQueryParamsIfPresent(url);

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
          var url = Utils.addQueryParamsIfPresent(call.url);
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