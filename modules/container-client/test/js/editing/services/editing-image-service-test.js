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
  var mockDocument;

  beforeEach(function() {
    mockDocument = [{
      location: {
        href: '' 
      }
    }];

    module(function($provide) {
      $provide.value('$document', mockDocument);
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

      mockDocument[0].location.href = 'path?a=b&c=d';
      service.addFile(file, onSuccess, jasmine.createSpy('onProgress'));
    });
    
    it('adds queryParams and encodes', function(){
      expect(com.ee.v2.RawFileUploader).toHaveBeenCalledWith(
        file,
        'a%20b.jpg?a=b&c=d',
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