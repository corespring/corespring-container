/* global com */
angular.module('corespring-editing.services').service('FileUploadUtils', [
  function() {

    return FileUploadUtils;

    //TODO - this is lifted from wiggi-wiz. Remove the duplication.
    function FileUploadUtils(fileTypes, unexpectedFileTypeErrorMessage) {

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

      this.acceptableFileTypes = function() {
        return fileTypes;
      };

      this.errors = {
        UNACCEPTABLE_TYPE: 'ERR_UNACCEPTABLE_TYPE',
        FILE_SIZE_EXCEEDED: 'ERR_FILE_SIZE_EXCEEDED'
      };


      this.acceptableType = function(fileType, acceptableTypes) {

        fileType = fileType || 'unknown-filetype';
        acceptableTypes = acceptableTypes || [];

        if (!_.contains(acceptableTypes, fileType)) {
          return {
            code: this.errors.UNACCEPTABLE_TYPE,
            fileType: fileType,
            message: unexpectedFileTypeErrorMessage
          };
        }
      };
    };
  }
]);