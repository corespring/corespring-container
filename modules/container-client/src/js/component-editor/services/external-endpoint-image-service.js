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
              var resultObject = {};

              if(_.isString(body)){
                resultObject.url = body;
              } 

              if(_.isString(resultObject.url)){
                onComplete(null, resultObject.url);
              } else {
                onComplete('No url provided in response: ' + JSON.stringify(body));
              }
            },
            onUploadProgress: function(progress) {
              $log.info('progress', arguments);
              onProgress(null, progress);
            },
            onUploadFailed: function(err) {
              $log.info('failed', arguments);
              onComplete('Upload failed for: ' + url + ': ' + err);
            }.bind(this)
          };

          new com.ee.v2.RawFileUploader(file, url, name, opts);
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