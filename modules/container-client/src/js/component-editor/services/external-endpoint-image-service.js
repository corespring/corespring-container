/* global com */
angular.module('corespring-singleComponentEditor.services')
  .factory(
    'ExternalEndpointsImageService', 
    ['$http','$log', 'UPLOAD_ENDPOINT', 
    function($http, $log, UPLOAD_ENDPOINT){

      function ExternalEndpointsImageService(){

        this.addFile = function(file, onComplete, onProgress) {

          var url = UPLOAD_ENDPOINT.url.replace(':filename', encodeURIComponent(file.name)); 

          var opts = {
            onUploadComplete: function(body, status) {
              $log.info('done: ', body, status);
              //TODO: Return body
              onComplete(null, body);
            },
            onUploadProgress: function(progress) {
              $log.info('progress', arguments);
              onProgress(null, progress);
            },
            onUploadFailed: function() {
              $log.info('failed', arguments);
              onComplete('Upload failed for: ' + url);
            }.bind(this)
          };

          var reader = new FileReader();

          reader.onloadend = function() {
            var uploader = new com.ee.RawFileUploader(file, reader.result, url, name, opts);
            uploader.beginUpload();
          };

          reader.readAsBinaryString(file);
        };

        this.deleteFile = function(url){
          $log.debug('!! deleteFile...', UPLOAD_ENDPOINT);

          $http({
            method: 'DELETE',
            url: url
          })
          .then(function(){
            console.log(arguments); 
          }, function(){
            console.log(arguments);
          });
        };
      }

      return ExternalEndpointsImageService;
}]);