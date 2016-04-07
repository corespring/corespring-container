describe('multipart-file-uploader', function(){

  beforeEach(angular.mock.module('corespring-editor.services'));

  var mocks = org.corespring.mocks.editor;

  beforeEach(module(function($provide){
    $provide.value('LogFactory', new mocks.LogFactory());
  }));

  var uploader, file, onSuccess, onFailure, onLoadEnd, uploadOpts;
  var mockUploader, mockUploaderConstructor; 
  var uploaderStash;

  beforeEach(inject(function(MultipartFileUploader){
    uploader = MultipartFileUploader;

    file = {
      name: 'file.png',
      size: 1
    };

    onSuccess = jasmine.createSpy('onSuccess');
    onFailure = jasmine.createSpy('onFailure');

    mockUploaderConstructor = jasmine.createSpy('uploader-constructor')
      .and.callFake(function(file, url, name, opts){
        uploadOpts = opts;
        return mockUploader;
      });

    window.com = {
      ee: {
        v2: {
          MultipartFileUploader: mockUploaderConstructor
        }
      }
    };

  }));

  describe('upload', function(){

    beforeEach(function(){
      uploader.upload('url', file, {foo: 'bar'}, onSuccess, onFailure);
    });

    it('constructs new Uploader', function(){
      expect(mockUploaderConstructor)
        .toHaveBeenCalledWith(
          file, 
          'url', 
          'file', 
          { additionalData: { foo: 'bar'},  
           onUploadComplete: jasmine.any(Function),
           onUploadProgress: jasmine.any(Function),
           onUploadFailed: jasmine.any(Function) });
    });

    it('calls onSuccess callback', function(){
      uploadOpts.onUploadComplete('{}', 200);
      expect(onSuccess).toHaveBeenCalledWith({});
    });
    
    it('calls onFailure callback', function(){
      uploadOpts.onUploadFailed();
      expect(onFailure).toHaveBeenCalledWith({
        code: 'UPLOAD_FAILED', message: 'upload failed!'
      });
    });
    
    it('calls onFailure with the xhr response if it is a json string with an \'error\' property', function(){
      uploadOpts.onUploadFailed({response: '{"error": "custom"}'});
      expect(onFailure).toHaveBeenCalledWith({
        code: 'UPLOAD_FAILED', message: 'custom'
      });
    });

  });
});