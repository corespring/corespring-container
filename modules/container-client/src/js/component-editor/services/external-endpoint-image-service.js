/* global com */
angular.module('corespring-singleComponentEditor.services')
  .factory(
    'ExternalEndpointsImageService', 
    ['$http','$log', 'MultipartFileUploader', 'UPLOAD_ENDPOINT', 
    function($http, $log, MultipartFileUploader, UPLOAD_ENDPOINT){

      function ExternalEndpointsImageService(){

        this.addFile = function(file, onComplete, onProgress) {

          var url = UPLOAD_ENDPOINT.url.replace(':filename', encodeURIComponent(file.name)); 

          MultipartFileUploader.upload(url, file, {}, function(result){

            function tryParsing(s){
              try { return JSON.parse(s); } 
              catch(e){
                return {url: s};
              }
            }

            var obj = _.isString(result) ? tryParsing(result) : _.isObject(result) ? result : {};

            if(!obj.url){
              onComplete(new Error('cant read a url from the result'));
            } else {
              onComplete(null, obj.url);
            }
          }, function(err){
            onComplete(err);
          });
        };

        this.deleteFile = function(url){
          $log.debug('!! deleteFile...', UPLOAD_ENDPOINT);

          $http({
            method: 'DELETE',
            url: url,
            withCredentials: true
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