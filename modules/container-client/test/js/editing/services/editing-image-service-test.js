/* global com, afterEach*/
describe('editing-image-service', function() {

  beforeEach(function() {
    angular.mock.module('corespring-editing.services');
  });

  var mockFileUploader;
  var mockFileReader;
  var uploadOpts;
  var service;
  var fileUploader;
  var queryParamsUtils;

  beforeEach(function() {

    queryParamUtils = org.corespring.mocks.editor.QueryParamUtils();

    module(function($provide) {
      $provide.value('QueryParamUtils', queryParamUtils);
    });
  });


  beforeEach(function() {

    mockFileUploader = {};
    
    window.com = {
      ee: {
        v2: {
          RawFileUploader: jasmine.createSpy('RawFileUploader::constructor').and.callFake(function(file, url, name, opts) {
            uploadOpts = opts;
            return mockFileUploader;
          })
        }
      }
    };
  });

  beforeEach(inject(function(EditingImageService) {
    service = EditingImageService;
  }));

  describe('addFile', function() {

    var onSuccess, file;

    beforeEach(function(){
      
      file = {
        name: 'a b.jpg',
        type: 'image/jpeg'
      };

      onSuccess = jasmine.createSpy('onSuccess');

      service.addFile(file, onSuccess, jasmine.createSpy('onProgress'));
    });
    
    
    it('calls QueryParamUtils.addQueryParams', function(){
      expect(queryParamUtils.addQueryParams).toHaveBeenCalledWith('a%20b.jpg');
    });

    it('encodes the url', function(){
      expect(com.ee.v2.RawFileUploader).toHaveBeenCalledWith(
        file,
        'a%20b.jpg',
        file.name,
        jasmine.any(Object)
        );
    });

    it('calls onComplete with url from the server', function() {
      uploadOpts.onUploadComplete('the-url-from-the-server');
      expect(onSuccess).toHaveBeenCalledWith(null, 'the-url-from-the-server');
    });

    it('calls onComplete with an error message', function() {
      uploadOpts.onUploadFailed('error');
      expect(onSuccess).toHaveBeenCalledWith(service.errorMessage);
    });
  });

});