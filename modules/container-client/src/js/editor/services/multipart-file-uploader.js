angular.module('corespring-editor.services')
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
              onSuccess(JSON.parse(body));
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

          new com.ee.v2.MultipartFileUploader( //jshint ignore:line
            file, 
            url, 
            fileParamName, 
            opts); //jshint ignore:line

        };
      }

      return new MultipartFileUploader();
    }
  ]);
