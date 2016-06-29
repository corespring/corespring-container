/* global com */
angular.module('corespring-editing.services').service('EditingFileUploadService', [
  '$http',
  '$log',
  '$timeout',
  'QueryParamUtils',
  function(
    $http,
    $log,
    $timeout,
    QueryParamUtils
  ) {

    function EditingFileUploadService(maxSizeKb, fileUploadUtils) {

      this.maxSizeKb = maxSizeKb;

      this.errorMessage = '<strong>Upload error</strong><br/>Your file was not uploaded. Please try again.';

      this.deleteFile = function(url) {
        $http({
          method: 'delete',
          url: QueryParamUtils.addQueryParams(url)
        });
      };

      this.addFile = function(file, onComplete, onProgress) {
        var url = QueryParamUtils.addQueryParams('' + encodeURIComponent(file.name));

        var typeError = fileUploadUtils.acceptableType(file.type, fileUploadUtils.acceptableFileTypes());

        if (typeError) {
          $timeout(function() {
            onComplete(typeError.message + ":" + typeError.fileType);
          });
          return;
        }

        if (fileUploadUtils.bytesToKb(file.size) > maxSizeKb) {
          $timeout(function() {
            onComplete(fileUploadUtils.fileTooBigError(file.size, maxSizeKb).message);
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

        //seems to be a global class
        new com.ee.v2.RawFileUploader(file, url, file.name, opts);
      };
    }

    return EditingFileUploadService;
  }
]);