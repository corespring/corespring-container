/* global com */
angular.module('corespring-editing.services').service('EditingAudioService', [
  'EditingFileUploadService',
  'FileUploadUtils',
  'MAX_AUDIO_UPLOAD_SIZE',
  function(
    EditingFileUploadService,
    FileUploadUtils,
    MAX_AUDIO_UPLOAD_SIZE
  ) {

    var fileUploadUtils = new FileUploadUtils(
      ['audio/mp3', 'audio/ogg'],
      'Only files in .mp3 or .ogg format can be uploaded.'
    );

    return new EditingFileUploadService(MAX_AUDIO_UPLOAD_SIZE, fileUploadUtils);
  }
]);