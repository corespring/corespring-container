describe('external-endpoint-image-service', function(){


  var Def;

  beforeEach(angular.mock.module('corespring-singleComponentEditor.services'));

  beforeEach(module(function($provide) {
    $provide.value('$http', {});
    $provide.value('UPLOAD_ENDPOINT', {url: 'url/:filename'});
  }));


  var e = org.corespring.mocks.editor;

  e.withWindowMocks({
    FileReader: new (e.FileReader())(),
    'com.ee.RawFileUploader': e['com.ee.RawFileUploader']()
  }, function(mocks){
    

    beforeEach(inject(function(ExternalEndpointsImageService) {
      Def = ExternalEndpointsImageService;
    }));

    describe('initialization', function(){
      it('inits', function(){
        expect(new Def()).not.toBe(undefined);
      });
    });
    
    describe('addFile', function(){
      it('inits', function(){
        var def = new Def();
        def.addFile('file', jasmine.createSpy('onComplete', 'onProgress'));
        expect(mocks.FileReader.readAsBinaryString).toHaveBeenCalled();
      });
    });

  });


});
