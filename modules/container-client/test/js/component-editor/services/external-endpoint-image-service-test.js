describe('external-endpoint-image-service', function(){

  var e = org.corespring.mocks.editor;
  var def, Def, multipartFileUploader, $http;

  function MultiPartFileUploader(){
    this.upload =  jasmine.createSpy('upload').and.callFake(function(url, file, opts, success, error){
      this.success = success;
      this.error = error;
    }.bind(this));
  }

  beforeEach(angular.mock.module('corespring-singleComponentEditor.services'));

  beforeEach(module(function($provide) {
    $http = e.$http();

    multipartFileUploader = new MultiPartFileUploader();

    $provide.value('$http', $http);
    $provide.value('MultipartFileUploader', multipartFileUploader);
    $provide.value('UPLOAD_ENDPOINT', {url: 'url/:filename'});
  }));


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
        method: 'DELETE', url: 'url', withCredentials: true
      });
    });
  });

  describe('addFile', function(){

    describe('successfully', function(){

      var m, onComplete;

      beforeEach(function(){
        def = new Def();
        onComplete = jasmine.createSpy('onComplete');
        def.addFile({name: 'file'}, onComplete, jasmine.createSpy('onProgress'));
        multipartFileUploader.success({url: 'url'});
      });

      it('calls onComplete', function(){
        expect(onComplete).toHaveBeenCalledWith(null, 'url');
      });
    });

    describe('with error', function(){

      beforeEach(function(){
        def = new Def();
        onComplete = jasmine.createSpy('onComplete');
        def.addFile({name: 'file'}, onComplete, jasmine.createSpy('onProgress'));
        multipartFileUploader.error('error');
      });

      it('calls onComplete with err', function(){
        expect(onComplete).toHaveBeenCalledWith('error');
      });

    });
  });


});
