angular.module('corespring-editing.services')
  .service('MultipartFileUploader', [
    'LogFactory',
    function(LogFactory) {

      function MultipartFileUploader() {

        var logger = LogFactory.getLogger('raw-file-uploader');

        /**
         * @fileParamName - the name of the form parameter that contains the file
         */
        this.upload = function(url, file, additionalParams, onSuccess, onFailure, fileParamName) {

          fileParamName = fileParamName || 'file';

          logger.debug('additionalParams', additionalParams);

          var opts = {
            additionalData: additionalParams,
            onUploadComplete: function(body, status) {
              logger.debug('done: ', body, status);

              try{
                onSuccess(JSON.parse(body));
              } 
              catch (e) {
                // no-op
              } finally {
                onSuccess(body);
              }
            },
            onUploadProgress: function(){
              console.log('upload progress: ', arguments);
            },
            onUploadFailed: function(xhr) {
              
              var error = {
                code: 'UPLOAD_FAILED',
                message: 'upload failed!'
              };

              try{
                logger.debug('failed', xhr.response);
                var response = JSON.parse(xhr.response);
                error.message = response.error  || 'upload failed';
              } catch(e) {
                // do nothing
              }

              onFailure(error);
            }
          };

          var reader = new FileReader();

          reader.onloadend = function() {
            var uploader = new com.ee.MultipartFileUploader( //jshint ignore:line
            file, 
            reader.result, 
            url, 
            fileParamName, 
            opts); //jshint ignore:line
            uploader.beginUpload();
          };

          reader.readAsBinaryString(file);
        };
      }

      return new MultipartFileUploader();
    }
  ]);