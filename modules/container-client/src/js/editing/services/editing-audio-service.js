/* global com */
angular.module('corespring-editing.services').service('EditingAudioService', [
  'EditingFileUploadService',
  'FileUploadUtils',
  function(
    EditingFileUploadService,
    FileUploadUtils
  ) {

    var fileUploadUtils = new FileUploadUtils(
      ['audio/mp3', 'audio/ogg'],
      'Only files in .mp3 or .ogg format can be uploaded.'
    );

    return new EditingFileUploadService(4096, fileUploadUtils);
  }
]);