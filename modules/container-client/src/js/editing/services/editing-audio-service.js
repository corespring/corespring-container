/* global com */
angular.module('corespring-editing.services').service('EditingAudioService', [
  'EditingFileUploadService',
  'FileUploadUtils',
  'MAX_AUDIO_UPLOAD_SIZE',
  function(
    EditingFileUploadService,
    FileUploadUtils,
    UPLOAD_AUDIO_MAX_SIZE_KB
  ) {

    var fileUploadUtils = new FileUploadUtils(
      ['audio/mp3', 'audio/ogg'],
      'Only files in .mp3 or .ogg format can be uploaded.'
    );

    return new EditingFileUploadService(UPLOAD_AUDIO_MAX_SIZE_KB, fileUploadUtils);
  }
]);