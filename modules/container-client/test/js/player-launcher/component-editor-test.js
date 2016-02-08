describe('component-editor', function () {
    
  var launcher, instance, Def, errorCodes, modules; 

  function MockLauncher(){

    this.init = jasmine.createSpy('init').and.returnValue(true);

    this.loadInstance = jasmine.createSpy('loadInstance').and.callFake(function(){
      return instance;
    });

    this.loadCall = jasmine.createSpy('loadCall').and.callFake(function(){
      return {method: 'GET', url: 'catalog/:itemId'};
    });

    this.mkInstance = jasmine.createSpy('mkInstance').and.callFake(function(){
        return instance;
    });
  }

  beforeEach(function () {
    corespring.mock.modules['launch-config'] = {};
    instance = {
      send: jasmine.createSpy('send')
    };
    launcher = new MockLauncher();
    corespring.mock.modules['client-launcher'] = function(){
      return launcher;
    };
    modules = corespring.require('component-editor');
    errorCodes = corespring.require('error-codes');
   
    errorCallback = jasmine.createSpy('errorCallback');
  });

  afterEach(function () {
    corespring.mock.reset();
  });

  describe('standalone', function(){

    var standalone;
    
    beforeEach(function(){

      launcher.loadCall.and.returnValue({
        method: 'GET', url: 'standalone'
      }); 

      Def = modules.Standalone;
    });

    describe('constructor', function(){

      it('should create a new instance', function(){
        standalone = new Def('element', {}, errorCallback);
        expect(standalone).not.toBe(undefined);
      });
      
      it('should call the errorCallback - if it can\'t find a url in the launch config', function(){
        launcher.loadCall.and.returnValue({});
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
        expect(instance.send).toHaveBeenCalledWith('getData', jasmine.any(Function));
      });

      it('should call instance.send(setData, data)', function(){
        standalone.setData(data, jasmine.createSpy('onSetData'));
        expect(instance.send).toHaveBeenCalledWith('setData', data, jasmine.any(Function));
      });
    });
  });

  describe('item', function(){

    var item;
    
    function ajaxFail(e, opts){
      opts.error({responseJSON: {error: e}});
    } 

    beforeEach(function(){

      launcher.loadCall.and.returnValue({
        method: 'GET', url: 'item'
      }); 

      Def = modules.Item;
      
      $.ajax = jasmine.createSpy('ajax').and.callFake(function(opts){
        opts.success({});
      });
    });

    describe('init', function(){

      it('calls errorCallback if createItem fails', function(){
        $.ajax.and.callFake(ajaxFail.bind(this, 'create failed'));
        item = new Def('element', {}, errorCallback);
        expect(errorCallback).toHaveBeenCalledWith(errorCodes.CREATE_ITEM_FAILED('create failed'));
      });

      it('calls errorCallback if load item fails', function(){
        $.ajax.and.callFake(ajaxFail.bind(this, 'load failed'));
        item = new Def('element', {itemId: 'itemId'}, errorCallback);
        expect(errorCallback).toHaveBeenCalledWith(errorCodes.LOAD_ITEM_FAILED('load failed'));
      });
    });
    
    it('calls errorCallback if item has no compoents', function(){
      $.ajax.and.callFake(function(opts){
        opts.success({components: {}});
      });
      item = new Def('element', {itemId: 'itemId'}, errorCallback);
      expect(errorCallback).toHaveBeenCalledWith(errorCodes.ONLY_ONE_COMPONENT_ALLOWED);
    });

    it('calls errorCallback if item has more than one component', function(){
      $.ajax.and.callFake(function(opts){
        opts.success({components: { 1: {}, 2: {}}});
      });
      item = new Def('element', {itemId: 'itemId'}, errorCallback);
      expect(errorCallback).toHaveBeenCalledWith(errorCodes.ONLY_ONE_COMPONENT_ALLOWED);
    });

    it('calls launcher.loadInstance', function(){
      $.ajax.and.callFake(function(opts){
        opts.success({components: { 1: {}}});
      });
      item = new Def('element', {itemId: 'itemId'}, errorCallback);

      /** Object(
      { method: 'GET', url: 'item' }), 
      Object({  }), 
      Object({ activePane: 'config', showNavigation: false, uploadUrl: 'item', 
      xhtml: undefined, componentModel: Object({  }) }), Function ].*/
      expect(launcher.loadInstance).toHaveBeenCalledWith(
        {method: 'GET', url: 'item'},
        jasmine.any(Object),
        {activePane: 'config', 
        showNavigation: false, 
        uploadUrl: 'item', 
        xhtml: undefined, 
        componentModel: {}}, 
        jasmine.any(Function));
    });
  });
});
