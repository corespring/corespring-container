describe('multipart-file-uploader', function(){

  beforeEach(angular.mock.module('corespring-editor.services'));

  var mocks = org.corespring.mocks.editor;

  beforeEach(module(function($provide){
    $provide.value('LogFactory', new mocks.LogFactory());
  }));

  var uploader, file, onSuccess, onFailure, onLoadEnd, uploadOpts;
  var mockFileReader, mockUploader, mockUploaderConstructor; 
  var fileReaderStash, uploaderStash;

  beforeEach(inject(function(MultipartFileUploader){
    uploader = MultipartFileUploader;

    mockFileReader = {
      readAsArrayBuffer: jasmine.createSpy('readAsArrayBuffer')
    };

    file = {
      name: 'file.png',
      size: 1
    };

    onSuccess = jasmine.createSpy('onSuccess');
    onFailure = jasmine.createSpy('onFailure');

    mockUploader = {
      beginUpload: jasmine.createSpy('beginUpload')
    };


    mockUploaderConstructor = jasmine.createSpy('uploader-constructor')
      .and.callFake(function(file, result, url, name, opts){
        uploadOpts = opts;
        return mockUploader;
      });

    window.com = {
      ee: {
        MultipartFileUploader: mockUploaderConstructor
      }
    };

    fileReaderStash = new mocks.Stash(window, 'FileReader', function(){return mockFileReader;});
  }));

  afterEach(function(){
    fileReaderStash.unstash();
  });

  describe('upload', function(){

    beforeEach(function(){
      uploader.upload('url', file, {foo: 'bar'}, onSuccess, onFailure);
      mockFileReader.onloadend();
    });

    it('calls reader.readAsArrayBuffer', function(){
      expect(mockFileReader.readAsArrayBuffer).toHaveBeenCalledWith(file);
    });

    it('constructs new Uploader', function(){
      expect(mockUploaderConstructor)
        .toHaveBeenCalledWith(
          file, 
          undefined, 
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