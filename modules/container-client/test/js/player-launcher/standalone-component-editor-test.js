describe('standalone component-editor', function () {

  var mockLauncher, mockInstance, standalone, Def, errorCodes; 

  function MockLauncher(){

    this.init = jasmine.createSpy('init').and.returnValue(true);

    this.loadInstance = jasmine.createSpy('loadInstance').and.callFake(function(){
      return mockInstance;
    });

    this.loadCall = jasmine.createSpy('loadCall').and.callFake(function(){
      return {method: 'GET', url: 'catalog/:itemId'};
    });

    this.mkInstance = jasmine.createSpy('mkInstance').and.callFake(function(){
        return mockInstance;
    });
  }

  beforeEach(function () {
    corespring.mock.modules['launch-config'] = {};
    mockInstance = {
      send: jasmine.createSpy('send')
    };
    mockLauncher = new MockLauncher();
    corespring.mock.modules['client-launcher'] = function(){
      return mockLauncher;
    };
    var modules = corespring.require('component-editor');
    Def = modules.Standalone;
    errorCodes = corespring.require('error-codes');
  });

  afterEach(function () {
    corespring.mock.reset();
  });

  describe('constructor', function(){

    var errorCallback;
    
    beforeEach(function(){
      mockLauncher.loadCall.and.returnValue({
        method: 'GET', url: 'standalone'
      });
      errorCallback = jasmine.createSpy('errorCallback');
    });

    it('should create a new instance', function(){
      standalone = new Def('element', {}, errorCallback);
      expect(standalone).not.toBe(undefined);
    });
    
    it('should call the errorCallback - if it can\'t find a url in the launch config', function(){
      mockLauncher.loadCall.and.returnValue({});
      standalone = new Def('element', {componentType: 't'}, errorCallback);
      expect(errorCallback).toHaveBeenCalledWith(errorCodes.CANT_FIND_URL('standaloneEditor'));
    });

    it('should call the errorCallback - if it can\'t find a componentType in the options', function(){
      standalone = new Def('element', {}, errorCallback);
      expect(errorCallback).toHaveBeenCalledWith(errorCodes.NO_COMPONENT_TYPE);
    });
    
    it('should call errorCallback if the uploadUrl is missing :filename', function(){
      standalone = new Def('element', {componentType: 't', uploadUrl: 'url'}, errorCallback);
      expect(errorCallback).toHaveBeenCalledWith(errorCodes.UPLOAD_URL_MISSING_FILENAME);
    });

    it('should define core methods on successful construction', function(){
      standalone = new Def('element', {componentType: 't'}, errorCallback);
      expect(_.isFunction(standalone.showNavigation)).toBe(true);
      expect(_.isFunction(standalone.showPane)).toBe(true);
      expect(_.isFunction(standalone.remove)).toBe(true);
    });
  });

  describe('getData and setData', function(){
    
    var data; 
    
    beforeEach(function(){
      data = {};
      standalone = new Def('element', {componentType: 'componentType'}, jasmine.createSpy('errorCallback'));
      standalone.getData();
    });

    it('should call instance.send(getData)', function(){
      standalone.getData();
      expect(mockInstance.send).toHaveBeenCalledWith('getData', jasmine.any(Function));
    });

    it('should call instance.send(setData, data)', function(){
      standalone.setData(data, jasmine.createSpy('onSetData'));
      expect(mockInstance.send).toHaveBeenCalledWith('setData', data, jasmine.any(Function));
    });
  });
});
