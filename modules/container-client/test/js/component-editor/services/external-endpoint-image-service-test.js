describe('external-endpoint-image-service', function(){

  var e = org.corespring.mocks.editor;
  var def, Def, fileReader, fileUploader, $http;

  beforeEach(angular.mock.module('corespring-singleComponentEditor.services'));

  beforeEach(module(function($provide) {
    $http = e.$http();
    $provide.value('$http', $http);
    $provide.value('UPLOAD_ENDPOINT', {url: 'url/:filename'});
  }));

  beforeAll(function(){
    fileReader = e.FileReader();
    fileUploader = e['com.ee.RawFileUploader']();
  });
    
  beforeEach(inject(function(ExternalEndpointsImageService) {
    Def = ExternalEndpointsImageService;
  }));
      
  describe('initialization', function(){
    it('inits', function(){
      expect(new Def()).not.toBe(undefined);
    });
  });

  describe('deleteFile', function(){

    beforeEach(function(){
      def = new Def();
      def.deleteFile('url');
    });

    it('calls $http', function(){
      expect($http).toHaveBeenCalledWith({
        method: 'DELETE', url: 'url'
      });
    });
  });

  describe('addFile', e.withWindowMocks(
    function(){ 
      return { FileReader: fileReader,
        'com.ee.RawFileUploader': fileUploader 
      };
    },
    function(getMocks){
      
      describe('successfully', function(){

        var m, onComplete;
        
        beforeEach(function(){
          m = getMocks();
          var uploader = m['com.ee.RawFileUploader']();
          uploader.beginUpload.and.callFake(function(){
            uploader.uploadOpts.onUploadComplete('url', 200);
          });
          def = new Def();
          onComplete = jasmine.createSpy('onComplete');
          def.addFile({name: 'file'}, onComplete, jasmine.createSpy('onProgress'));
        });

        it('calls reader.readAsBinaryString', function(){
          expect(m.FileReader().readAsBinaryString).toHaveBeenCalled();
        });
        
        it('calls fileUploader.beginUpload', function(){
          expect(m['com.ee.RawFileUploader']().beginUpload).toHaveBeenCalled();
        });
        
        it('calls onComplete', function(){
          expect(onComplete).toHaveBeenCalledWith(null, 'url');
        });
      });
         
      describe('with error', function(){
          
          var m; 
          beforeEach(function(){
            m = getMocks();
            def = new Def();
            onComplete = jasmine.createSpy('onComplete');
            var uploader = m['com.ee.RawFileUploader']();
            uploader.beginUpload.and.callFake(function(){
              uploader.uploadOpts.onUploadFailed('err');
            });
            def.addFile({name: 'file'}, onComplete, jasmine.createSpy('onProgress'));
          });
          
          it('calls onComplete with err', function(){
            expect(onComplete).toHaveBeenCalledWith('Upload failed for: url/file: err');
          });

      });
  }));


});
