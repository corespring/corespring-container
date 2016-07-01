/* global com */
/* global com */
angular.module('corespring-editing.services').service('EditingImageService', [
  'EditingFileUploadService',
  'FileUploadUtils',
  function(
    EditingFileUploadService,
    FileUploadUtils
  ) {

    var fileUploadUtils = new FileUploadUtils(
      ['image/png', 'image/gif', 'image/jpeg'],
      'Only files in .jpeg, .jpg, .png or .gif formats can be uploaded.'
    );

    return new EditingFileUploadService(500, fileUploadUtils);
  }
]);