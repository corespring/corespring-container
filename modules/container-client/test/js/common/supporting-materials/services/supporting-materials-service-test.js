describe('supporting materials service', function() {

  var service;

  var mockHttp, innerHttp, mockSmUtils, mockUrls, mockMultipartFileUploader;
  var onSuccess, onError;

  beforeEach(angular.mock.module('corespring-common.supporting-materials.services'));

  function mkCall(url, method){
    return {
      method: method || 'get',
      url: url 
    };
  }

  beforeEach(module(function($provide) {

    mockHttp = jasmine.createSpy('http.constructor').and.callFake(function(){
      mockHttp.promise = new org.corespring.mocks.editor.MockPromise();
      return mockHttp.promise;
    });


    function spyWithPromise(name){
      var spy = jasmine.createSpy(name);
      spy.and.callFake(function(){
        spy.promise = new org.corespring.mocks.editor.MockPromise();
        return spy.promise; 
      });
      return spy;
    } 

    mockHttp.get = spyWithPromise('get');
    mockHttp.post = spyWithPromise('post');
    mockHttp['delete'] = spyWithPromise('delete'); 

    jasmine.createSpy('delete').and.callFake(function(){
      console.log('?', this);
      this.promise = new org.corespring.mocks.editor.MockPromise();
      return this.promise; 
    });

    mockSmUtils = {
      addQueryParamsIfPresent: jasmine.createSpy('addQueryParamsIfPresent').and.callFake(function(url){
        return url;
      }),
      getBinaryUrl: jasmine.createSpy('getBinaryUrl').and.returnValue('binary-url')
    };
    
    mockUrls = {};


    mockMultipartFileUploader = {
      upload: jasmine.createSpy('upload')
    };
    
    onSuccess = jasmine.createSpy('onSuccess');
    onError = jasmine.createSpy('onError');

    $provide.value('$http', mockHttp);
    $provide.value('MultipartFileUploader', mockMultipartFileUploader);
    $provide.value('LogFactory', org.corespring.mocks.editor.LogFactory);
    $provide.value('SupportingMaterialUrls', mockUrls);
    $provide.value('SmUtils', mockSmUtils);
  }));

  beforeEach(inject(function(SupportingMaterialsService) {
    service = SupportingMaterialsService;
  }));
  
  describe('updateContent', function() {
    beforeEach(function(){
      mockUrls.updateContent = {url: 'url/:name/:filename', method: 'get'};
      onSuccess = jasmine.createSpy('onSuccess');
      onError = jasmine.createSpy('onError');
      service.updateContent('name', 'filename', 'hi', onSuccess, onError);
      mockHttp.promise.triggerSuccess('ok');
      mockHttp.promise.triggerError('not ok');
    });

    it('calls $http', function(){
      expect(mockHttp).toHaveBeenCalledWith({ 
          method: 'GET', 
          url: 'url/name/filename', 
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          data: 'hi' 
        });       
    });

    it('calls onSuccess', function(){
      expect(onSuccess).toHaveBeenCalledWith('ok');
    });
    
    it('calls onError', function(){
      expect(onError).toHaveBeenCalledWith('not ok');
    });
  });

  describe('getFileSizeInKB', function() {
    
    var headers;

    beforeEach(function(){
      onSuccess = jasmine.createSpy('onSuccess');
      onError = jasmine.createSpy('onError');
      service.getFileSizeInKB({name:'name'}, {name:'filename'}, onSuccess, onError);
      headers = jasmine.createSpy('headers').and.returnValue(1024);
      mockHttp.get.promise.triggerSuccess('data', 200, headers);
      mockHttp.get.promise.triggerError('not ok');
    });

    it('calls $http.get', function(){
      expect(mockHttp.get).toHaveBeenCalledWith(mockSmUtils.getBinaryUrl());       
    });

    it('calls success', function(){
      expect(onSuccess).toHaveBeenCalledWith(1);
    });
    
    it('calls error', function(){
      expect(onError).toHaveBeenCalledWith();
    });
  });

  describe('getBinaryUrl', function() {
    it('calls SmUtils.getBinaryUrl', function(){
      service.getBinaryUrl({name:'material'}, {name: 'filename'});
      expect(mockSmUtils.getBinaryUrl).toHaveBeenCalledWith({name:'material'}, {name: 'filename'});
    });
  });

  describe('getAssetUrl', function() {
    it('calls getBinaryUrl', function(){
      service.getAssetUrl('material', 'filename');
      expect(mockSmUtils.getBinaryUrl).toHaveBeenCalledWith({name:'material'}, {name: 'filename'});
    });
  });
  
  describe('deleteAsset', function() {
    
    beforeEach(function(){
      mockUrls.deleteAsset = {url: 'url/:name/:filename', method: 'delete'};
    });

    it('calls $http.delete', function(){
      service.deleteAsset('material', 'filename');
      expect(mockHttp['delete']).toHaveBeenCalledWith('url/material/filename');
    });
  });
  
  describe('addAsset', function() {

    var uploadSuccess, uploadError;

    beforeEach(function(){
      mockUrls.addAsset = {method: 'post', url: 'url/:name'};
      onError = jasmine.createSpy('error');
      onSuccess = jasmine.createSpy('success');

      function onUpload(url, file, opts, success, error){
        uploadSuccess = success;
        uploadError = error;
      }

      mockMultipartFileUploader.upload.and.callFake(onUpload);
      service.addAsset('material', {name: 'file'}, onSuccess, onError);
    });

    it('calls MultipartFileUploader.upload', function(){

      expect(mockMultipartFileUploader.upload).toHaveBeenCalledWith(
        'url/material', 
        {name:'file'}, 
        {}, 
        jasmine.any(Function), 
        jasmine.any(Function));
    });

    it('calls back to success handler', function(){
      uploadSuccess({});
      expect(onSuccess).toHaveBeenCalledWith(null, 'file');
    });
  });
    
  function addQueryParamsCalledWith(url){
    return function(){
      expect(mockSmUtils.addQueryParamsIfPresent).toHaveBeenCalledWith(url);
    };
  }

  function successHandlerCalled(method){
    return function(){
      mockHttp[method].promise.triggerSuccess('ok');
      expect(onSuccess).toHaveBeenCalledWith('ok');
    };
  }

  function errorHandlerCalled(method){
    return function(){
      mockHttp[method].promise.triggerError('not ok');
      expect(onError).toHaveBeenCalledWith('not ok') ;
    };
  }
  
  describe('create', function() {


    describe('create from file', function(){

      var uploadSuccess, uploadError;
      beforeEach(function(){
        mockUrls.createFromFile = {method: 'post', url: 'create-from-file'};
        function onUpload(url, file, opts, success, error){
          uploadSuccess = success;
          uploadError = error;
        }

        mockMultipartFileUploader.upload.and.callFake(onUpload);
        service.create({name: 'material', materialType: 'type', file: {_t: 'File'}}, onSuccess, onError);
      });
      
      it('calls MultipartFileUploader.upload', function(){
        expect(mockMultipartFileUploader.upload).toHaveBeenCalledWith(
          'create-from-file',
          {_t: 'File'},
          { name: 'material', materialType: 'type' },
          jasmine.any(Function),
          jasmine.any(Function));
      });
      
      it('calls SmUtils.addQueryParamsIfPresent', addQueryParamsCalledWith('create-from-file'));

      it('calls success handler', function(){
        uploadSuccess({name: 'new material'});
        expect(onSuccess).toHaveBeenCalledWith({name: 'new material'});
      });
      
      it('calls error handler', function(){
        uploadError('error');
        expect(onError).toHaveBeenCalledWith('error');
      });
    });

    describe('create from markup', function(){

      var call = {url: 'create', method: 'post'};
      var data = {name: 'material', materialType: 'materialType'};

      beforeEach(function(){
        mockUrls.create = call ;
        service.create( data, onSuccess, onError );
      });

      it('calls create', function(){
        expect(mockHttp.post)
          .toHaveBeenCalledWith(
          mockUrls.create.url, {name: 'material', materialType: 'materialType', html: '<div>material</div>'});
      });
    
      it('calls SmUtils.addQueryParamsIfPresent', addQueryParamsCalledWith('create'));
      it('calls success handler', successHandlerCalled('post'));
      it('calls error handler', errorHandlerCalled('post'));
    });
  });
  
  describe('delete', function() {

    beforeEach(function(){
      mockUrls.delete = {method: 'delete', url: 'delete/:name'};
      service.delete({name:'material'}, onSuccess, onError);
    });

    it('calls $http.delete', function(){
      expect(mockHttp.delete).toHaveBeenCalledWith('delete/material');
    });

    it('calls SmUtils.addQueryParamsIfPresent', addQueryParamsCalledWith('delete/:name'));
    it('calls success handler', successHandlerCalled('delete'));
    it('calls error handler', errorHandlerCalled('delete'));

  });

});