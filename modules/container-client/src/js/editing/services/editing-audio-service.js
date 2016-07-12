/* global com */
angular.module('corespring-editing.services').service('EditingAudioService', [
  'EditingFileUploadService',
  'FileUploadUtils',
  'UPLOAD_AUDIO_MAX_SIZE_KB',
  function(
    EditingFileUploadService,
    FileUploadUtils,
    UPLOAD_AUDIO_MAX_SIZE_KB
  ) {

    var fileUploadUtils = new FileUploadUtils(
      ['audio/mp3', 'audio/mpeg'],
      'Only files in .mp3 format can be uploaded.'
    );

    return new EditingFileUploadService(UPLOAD_AUDIO_MAX_SIZE_KB, fileUploadUtils);
  }
]);