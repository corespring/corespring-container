/* global com */
/* global com */
angular.module('corespring-editing.services').service('EditingImageService', [
  'EditingFileUploadService',
  'FileUploadUtils',
  'UPLOAD_IMAGE_MAX_SIZE_KB',
  function(
    EditingFileUploadService,
    FileUploadUtils,
    UPLOAD_IMAGE_MAX_SIZE_KB
  ) {

    var fileUploadUtils = new FileUploadUtils(
      ['image/png', 'image/gif', 'image/jpeg'],
      'Only files in .jpeg, .jpg, .png or .gif formats can be uploaded.'
    );

    return new EditingFileUploadService(UPLOAD_IMAGE_MAX_SIZE_KB, fileUploadUtils);
  }
]);