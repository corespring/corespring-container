angular.module('corespring-editor.services').service('RawFileUploader', [
  'LogFactory',
  function(LogFactory) {

    function RawFileUploader(){
      
      var logger = LogFactory.getLogger('raw-file-uploader');


      this.upload = function(url, file, onSuccess, onFailure){

        var opts = {
          onUploadComplete: function(body, status) {
            logger.debug('done: ', body, status);
            onSuccess(url);
          },
          onUploadFailed: function() {
            logger.debug('failed', arguments);
            onFailure({
              code: 'UPLOAD_FAILED',
              message: 'upload failed!'
            });
          }
        };

        var reader = new FileReader();

        reader.onloadend = function() {
          var uploader = new com.ee.RawFileUploader(file, reader.result, url, file.name, opts); //jshint ignore:line
          uploader.beginUpload();
        };

        reader.readAsBinaryString(file);
      };
    }

    return new RawFileUploader();
  }]);