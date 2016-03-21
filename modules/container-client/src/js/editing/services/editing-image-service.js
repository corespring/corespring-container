/* global com */
angular.module('corespring-editing.services').service( 'EditingImageService', [
  '$log',
  '$document',
  '$http',
  '$timeout',
  function($log, $document, $http, $timeout) {

    //TODO - this is lifted from wiggi-wiz. Remove the duplication.
    var ImageUtils = function() {

      var byteToKBMultiplier = 0.000976563;

      this.bytesToKb = function(bytes) {
        var sizeInKb = bytes * byteToKBMultiplier;
        var rounded = Math.floor(sizeInKb * 100) / 100;
        return rounded;
      };

      this.fileTooBigError = function(sizeInBytes, maxSizeInKb) {
        var sizeInKb = this.bytesToKb(sizeInBytes);
        return {
          code: this.errors.FILE_SIZE_EXCEEDED,
          message: 'The file is too big (' + sizeInKb + 'kb), the maximum is: ' + maxSizeInKb + 'kb.'
        };
      };

      this.imageTypes = function(){
        return ['image/png', 'image/gif', 'image/jpeg'];
      };

      this.errors = {
        UNACCEPTABLE_TYPE: 'ERR_UNACCEPTABLE_TYPE',
        FILE_SIZE_EXCEEDED: 'ERR_FILE_SIZE_EXCEEDED'
      };


      this.acceptableType = function(fileType, acceptableTypes){
       
        fileType = fileType || 'unknown-filetype'; 
        acceptableTypes = acceptableTypes  || [];

        if(!_.contains(acceptableTypes, fileType)){
          return {
            code: this.errors.UNACCEPTABLE_TYPE,
            fileType: fileType,
            message: 'Only files in .jpeg, .jpg, .png or .gif formats can be uploaded.'
          };
        } 
      };
    };

    var imageUtils = new ImageUtils();

    function EditingImageService() {

      function addQueryParamsIfPresent(path) {
        var doc = $document[0];
        var href = doc.location.href;
        path = path.indexOf('?') === -1 ? path : path.split('?')[0];
        return path + (href.indexOf('?') === -1 ? '' :  '?' + href.split('?')[1]);
      }
      
      this.errorMessage = '<strong>Upload error</strong><br/>Your image was not uploaded. Please try again.';

      this.deleteFile = function(url) {
        $http['delete'](addQueryParamsIfPresent(url));
      };

      this.addFile = function(file, onComplete, onProgress) {
        var url = addQueryParamsIfPresent('' + encodeURIComponent(file.name));

       var typeError = imageUtils.acceptableType(file.type, imageUtils.imageTypes());

       if(typeError){
          $timeout(function() {
            onComplete(typeError.message);
          });
          return;
        }

        if (imageUtils.bytesToKb(file.size) > 500) {
          $timeout(function() {
            onComplete(imageUtils.fileTooBigError(file.size, 500).message);
          });
          return;
        }

        var opts = {
          onUploadComplete: function(body, status) {
            $log.info('done: ', body, status);
            var uploadedUrl = body && body.url ? body.url : body;
            onComplete(null, uploadedUrl);
          },
          onUploadProgress: function(progress) {
            $log.info('progress', arguments);
            onProgress(null, progress);
          },
          onUploadFailed: function() {
            $log.info('failed', arguments);
            onComplete(this.errorMessage);
          }.bind(this)
        };

        new com.ee.v2.RawFileUploader(file, url, file.name, opts);
      };
    }

    return new EditingImageService();
  }
]);
